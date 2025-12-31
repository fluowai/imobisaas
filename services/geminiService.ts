
import { GoogleGenAI, Type } from "@google/genai";
import { Property, Lead } from "../types";

// Lazy initialization para evitar crash quando API key não está disponível
let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    if (!apiKey) {
      console.warn("⚠️ VITE_GEMINI_API_KEY não configurada - funcionalidades de IA desabilitadas");
      return null;
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const generateSmartDescription = async (property: Partial<Property>) => {
  const prompt = `Gere uma descrição atraente e profissional para um imóvel com as seguintes características:
    Tipo: ${property.type}
    Localização: ${property.location?.neighborhood}, ${property.location?.city}
    Quartos: ${property.features?.bedrooms}
    Banheiros: ${property.features?.bathrooms}
    Área: ${property.features?.area}m²
    Vagas: ${property.features?.garages}
    
    A descrição deve ser persuasiva, destacando os benefícios de morar no local e as qualidades do imóvel.`;

  const client = getAI();
  if (!client) {
    return "Funcionalidade de IA não disponível. Configure VITE_GEMINI_API_KEY.";
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: "Você é um mestre em copywriting imobiliário brasileiro.",
        temperature: 0.7,
      }
    });
    return response.text || "Descrição não gerada.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Erro ao gerar descrição com IA.";
  }
};

export const matchLeadWithProperties = async (lead: Lead, properties: Property[]) => {
  const propertySummary = properties.map(p => ({
    id: p.id,
    title: p.title,
    price: p.price,
    features: p.features,
    location: p.location.neighborhood
  }));

  const prompt = `Analise o perfil do cliente abaixo e recomende os 3 melhores imóveis da lista fornecida que mais se adequam às suas necessidades.
    Cliente: ${lead.name}, Budget: R$ ${lead.budget}, Preferências: ${JSON.stringify(lead.preferences)}
    
    Imóveis: ${JSON.stringify(propertySummary)}
    
    Retorne uma justificativa para cada recomendação.`;

  const client = getAI();
  if (!client) {
    return "Funcionalidade de IA não disponível. Configure VITE_GEMINI_API_KEY.";
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: "Você é um consultor imobiliário experiente que foca em matching de alta conversão.",
      }
    });
    return response.text || "Nenhuma recomendação disponível.";
  } catch (error) {
    console.error("Error matching lead:", error);
    return "Erro ao processar recomendações com IA.";
  }
};
