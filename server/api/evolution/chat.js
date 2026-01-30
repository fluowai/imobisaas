
import { supabase } from '../../supabase.js';
import axios from 'axios';

// GET /api/evolution/chats
export async function getChats(req, res) {
  try {
    // Agora buscamos da tabela contacts, que representa "Conversas"
    // E idealmente buscaríamos a última mensagem de cada um
    
    // 1. Buscar contatos da organização (assumindo single tenant no context do request por enquanto, 
    // mas o Supabase client vai usar a chave de serviço que vê tudo. Precisamos filtrar se fosse multi-tenant real no backend)
    // O ideal seria pegar o tenant do header, mas vamos simplificar pegando os ultimos contatos com mensagens.

    const { data: contacts, error } = await supabase
      .from('contacts')
      .select(`
        *,
        messages (
            content,
            timestamp,
            status
        )
      `)
      .order('updated_at', { ascending: false }) // Idealmente teríamos um updated_at no contato quando chega msg
      .limit(50); // Paginação futura

    if (error) throw error;

    // Formatar para o frontend
    const chats = contacts.map(contact => {
        // Encontrar a msg mais recente manualmente pois o join traz todas (idealmente faríamos uma query mais otimizada)
        const sortedMsgs = (contact.messages || []).sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        const lastMsg = sortedMsgs[0];

        return {
          jid: contact.remote_jid,
          name: contact.push_name || contact.remote_jid,
          profilePicUrl: contact.profile_pic_url,
          lastMessage: lastMsg ? lastMsg.content : '',
          timestamp: lastMsg ? lastMsg.timestamp : contact.created_at,
          unreadCount: 0 // Futuro: count where status != read
        };
    });

    // Reordenar por timestamp da mensagem
    chats.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({ success: true, chats });

  } catch (error) {
    console.error('Erro ao listar chats:', error);
    res.status(500).json({ error: error.message });
  }
}

// GET /api/evolution/messages/:remoteJid
export async function getMessages(req, res) {
  try {
    const { remoteJid } = req.params;
    
    // 1. Achar o contato primeiro
    const { data: contact } = await supabase
        .from('contacts')
        .select('id')
        .eq('remote_jid', remoteJid)
        .single();

    if (!contact) {
        return res.json({ success: true, messages: [] });
    }

    // 2. Buscar mensagens
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('contact_id', contact.id)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    // Mapear campos antigos para manter compatibilidade com frontend se necessário
    const formatted = data.map(m => ({
        id: m.id,
        remote_jid: remoteJid,
        content: m.content || (m.media_type !== 'text' ? `[${m.media_type}]` : ''),
        from_me: m.from_me,
        timestamp: m.timestamp,
        status: m.status
    }));

    res.json({ success: true, messages: formatted });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({ error: error.message });
  }
}

// POST /api/evolution/messages/send
export async function sendMessage(req, res) {
  try {
    const { remoteJid, text } = req.body;
    
    // 1. Buscar config
    const { data: settings } = await supabase
      .from('site_settings')
      .select('integrations, organization_id')
      .single();
      
    if (!settings?.integrations?.evolutionApi?.enabled) {
      return res.status(400).json({ error: 'Evolution API não configurada' });
    }

    const config = settings.integrations.evolutionApi;
    const organizationId = settings.organization_id;

    // 2. Enviar via Evolution
    const apiUrl = `${config.baseUrl}/message/sendText/${config.instanceName}`;
    const number = remoteJid.replace('@s.whatsapp.net', '');

    await axios.post(apiUrl, {
        number: number,
        text: text
    }, {
        headers: {
            'apikey': config.token,
            'Content-Type': 'application/json'
        }
    });

    // 3. Salvar no Banco (Agora usando Schema Normalizado)
    
    // 3.1 Achar ou Criar Contato
    // (Pode ser otimizado para não repetir lógica, mas para segurança fazemos aqui também)
    let { data: contact } = await supabase
        .from('contacts')
        .select('id, instance_id')
        .eq('organization_id', organizationId)
        .eq('remote_jid', remoteJid)
        .single();

    if (!contact) {
        // Se não existir, precisamos do instance_id.
        // Assumindo que o settings tem a info correta da instancia em uso
        const { data: instance } = await supabase
            .from('instances')
            .select('id')
            .eq('organization_id', organizationId)
            .limit(1)
            .single(); // Pega a primeira instância da organização
            
        if (!instance) throw new Error("Instância não encontrada para esta organização");

        const { data: newContact } = await supabase.from('contacts').insert({
            organization_id: organizationId,
            instance_id: instance.id,
            remote_jid: remoteJid,
            push_name: number // Nome provisório
        }).select().single();
        
        contact = newContact;
    }

    // 3.2 Inserir Mensagem
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        organization_id: organizationId,
        instance_id: contact.instance_id,
        contact_id: contact.id,
        content: text,
        from_me: true,
        timestamp: new Date().toISOString(),
        status: 'sent',
        media_type: 'text'
      }])
      .select()
      .single();

    if (error) console.error('Erro ao salvar msg enviada:', error);

    res.json({ success: true, message: data });

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: error.message });
  }
}
