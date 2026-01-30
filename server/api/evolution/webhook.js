
import { supabase } from '../../supabase.js';

// Token de segurança definido pelo usuário
const WEBHOOK_TOKEN = 'FX8aVOSIDtzZsxaKg697b9539a5b58';

/**
 * Endpoint Principal do Webhook
 */
export default async function webhookHandler(req, res) {
  const method = req.method;
  
  // 1. Health Check rápido (GET)
  if (method === 'GET') {
    return res.status(200).json({ status: 'online', service: 'Evolution Webhook Processor' });
  }

  // 2. Validação de Segurança (Bearer Token)
  const authHeader = req.headers['authorization'];
  if (!authHeader || authHeader !== `Bearer ${WEBHOOK_TOKEN}`) {
    console.warn('⛔ Tentativa de acesso não autorizado ao webhook:', req.ip);
    return res.status(403).json({ error: 'Forbidden' });
  }

  // 3. Resposta Imediata (Não bloquear o sender)
  // Evolution espera um 200 OK rápido. Se demorar, ele pode tentar reenviar.
  res.status(200).send('OK');

  // 4. Processamento Assíncrono (Fire and Forget para o client, mas await interno)
  const payload = req.body;
  
  try {
    await processPayload(payload);
  } catch (err) {
    console.error('❌ Erro no processamento assíncrono:', err);
    // Não temos como responder erro pro client pois já enviamos 200.
    // Console log é a única saída aqui.
  }
}

/**
 * Lógica de Processamento (Business Logic)
 */
async function processPayload(data) {
  // Data vem da Evolution. Formato comum:
  // { type: 'messages.upsert', instance: 'instance_name', data: { ... } }
  // Ou as vezes o instance vem na URL, depende da config.
  // Assumindo que o body tem `instance` e `data`.
  
  const eventType = data.type;
  const instanceName = data.instance; // Importante: nome da instância
  const eventData = data.data;

  // Log "leve"
  // console.log(`📨 Webhook [${instanceName}]: ${eventType}`);

  if (eventType !== 'messages.upsert') {
    return; // Por enquanto só queremos mensagens
  }

  if (!eventData || !eventData.key) return;

  // 1. Identificar a Organização dona dessa Instância
  // Cachear isso seria ideal em produção de altíssimo volume.
  const { data: instanceDB, error: instError } = await supabase
    .from('instances')
    .select('id, organization_id')
    .eq('name', instanceName)
    .single();

  if (instError || !instanceDB) {
    console.warn(`⚠️ Instância desconhecida: ${instanceName}. Mensagem ignorada.`);
    // Opcional: Criar instância "unassigned" automaticamente se quiser
    return;
  }

  const organizationId = instanceDB.organization_id;

  // 2. Extrair dados da mensagem
  const { key, message, messageType, pushName } = eventData;
  const remoteJid = key.remoteJid;
  const fromMe = key.fromMe;
  const messageId = key.id;
  const timestamp = eventData.messageTimestamp || Date.now() / 1000; // vem em seconds geralmente

  // 3. Normalizar Conteúdo
  let content = '';
  let mediaType = 'text'; // text, image, video, audio, document
  
  if (messageType === 'conversation') {
    content = message.conversation;
  } else if (messageType === 'extendedTextMessage') {
    content = message.extendedTextMessage.text;
  } else if (messageType === 'imageMessage') {
    mediaType = 'image';
    content = message.imageMessage.caption || '[Imagem]';
  } else if (messageType === 'videoMessage') {
    mediaType = 'video';
    content = message.videoMessage.caption || '[Vídeo]';
  } else if (messageType === 'audioMessage') {
    mediaType = 'audio';
    content = '[Áudio]';
  } else if (messageType === 'documentMessage') {
    mediaType = 'document';
    content = message.documentMessage.title || '[Documento]';
  }

  // 4. Upsert Contato
  // Tenta encontrar ou criar o contato NAQUELA organização
  // Usamos upsert para garantir id
  
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('remote_jid', remoteJid)
    .single();
    
  let contactId;
  
  if (!contact) {
    // Cria novo
    const { data: newContact, error: createError } = await supabase
      .from('contacts')
      .insert({
        organization_id: organizationId,
        instance_id: instanceDB.id,
        remote_jid: remoteJid,
        push_name: pushName || remoteJid.split('@')[0],
        profile_pic_url: null // Evolution as vezes manda url separada, ignorar por agora
      })
      .select('id')
      .single();
      
    if (createError) {
      console.error('Erro criando contato:', createError);
      return; 
    }
    contactId = newContact.id;
  } else {
    contactId = contact.id;
  }

  // 5. Salvar Mensagem
  await supabase.from('messages').insert({
    organization_id: organizationId,
    instance_id: instanceDB.id,
    contact_id: contactId,
    
    key_id: key.id,
    message_id: messageId, // Às vezes é o mesmo que key.id
    
    content: content,
    media_type: mediaType,
    // media_url: ... (Upload da mídia requer download do buffer, complexo p/ este passo único)
    
    from_me: fromMe,
    status: fromMe ? 'sent' : 'delivered',
    timestamp: new Date(timestamp * 1000).toISOString(),
    
    raw_payload: data // Salva o JSON bruto por segurança
  });
  
  console.log(`✅ [${instanceName}] Msg salva de ${pushName || remoteJid}: "${content?.substring(0, 20)}..."`);
}
