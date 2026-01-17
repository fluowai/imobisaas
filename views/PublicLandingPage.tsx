import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { landingPageService } from '../services/landingPages';
import { LandingPage, BlockType } from '../types/landingPage';
import { Loader } from 'lucide-react';

// Import public block components
import HeaderBlock from '../components/LandingPageBlocks/HeaderBlock';
import FooterBlock from '../components/LandingPageBlocks/FooterBlock';
import HeroBlock from '../components/LandingPageBlocks/HeroBlock';
import PropertyGridBlock from '../components/LandingPageBlocks/PropertyGridBlock';
import TextBlock from '../components/LandingPageBlocks/TextBlock';
import FormBlock from '../components/LandingPageBlocks/FormBlock';
import CTABlock from '../components/LandingPageBlocks/CTABlock';
import SpacerBlock from '../components/LandingPageBlocks/SpacerBlock';
import GalleryBlock from '../components/LandingPageBlocks/GalleryBlock';
import StatsBlock from '../components/LandingPageBlocks/StatsBlock';
import ImageBlock from '../components/LandingPageBlocks/ImageBlock';
import PropertyCarouselBlock from '../components/LandingPageBlocks/PropertyCarouselBlock';
import MapBlock from '../components/LandingPageBlocks/MapBlock';
import TimelineBlock from '../components/LandingPageBlocks/TimelineBlock';
import VideoBlock from '../components/LandingPageBlocks/VideoBlock';
import TestimonialsBlock from '../components/LandingPageBlocks/TestimonialsBlock';
import BrokerCardBlock from '../components/LandingPageBlocks/BrokerCardBlock';
import DividerBlock from '../components/LandingPageBlocks/DividerBlock';
import { useSettings } from '../context/SettingsContext'; // For public page might fallback/fail gracefully if context missing

const PublicLandingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPreview = searchParams.get('preview') === 'true';

  useEffect(() => {
    loadPage();
  }, [slug]);

  const loadPage = async () => {
    if (!slug) {
      setError('Slug não fornecido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await landingPageService.getBySlug(slug);
      setPage(data);
      
      // Track view (não registrar em preview mode)
      if (!isPreview && data.id) {
        await landingPageService.trackView(data.id, {
          userAgent: navigator.userAgent,
          referrer: document.referrer
        });
      }
    } catch (err) {
      console.error('Error loading page:', err);
      setError('Landing page não encontrada ou não publicada');
    } finally {
      setLoading(false);
    }
  };

  const getContainerClass = (width?: string) => {
    switch (width) {
      case 'sm': return 'max-w-3xl mx-auto px-4';
      case 'md': return 'max-w-5xl mx-auto px-4';
      case 'lg': return 'max-w-6xl mx-auto px-4';
      case 'xl': return 'max-w-7xl mx-auto px-4';
      case 'full': return 'w-full';
      default: return 'w-full'; 
    }
  };

  const renderBlock = (block: any) => {
    const theme = page?.themeConfig;
    if (!theme) return null;

    switch (block.type) {
      case BlockType.HEADER:
        return <HeaderBlock config={block.config} theme={theme} />;
      case BlockType.FOOTER:
        return <FooterBlock config={block.config} theme={theme} />;
      case BlockType.HERO:
        return <HeroBlock config={block.config} theme={theme} />;
      case BlockType.PROPERTY_GRID:
        return <PropertyGridBlock config={block.config} theme={theme} />;
      case BlockType.TEXT:
        return <TextBlock config={block.config} theme={theme} />;
      case BlockType.IMAGE:
        return <ImageBlock config={block.config} theme={theme} />;
      case BlockType.GALLERY:
        return <GalleryBlock config={block.config} theme={theme} />;
      case BlockType.PROPERTY_CAROUSEL:
        return <PropertyCarouselBlock config={block.config} theme={theme} />;
      case BlockType.STATS:
        return <StatsBlock config={block.config} theme={theme} />;
      case BlockType.FORM:
        return <FormBlock config={block.config} theme={theme} />;
      case BlockType.CTA:
        return <CTABlock config={block.config} theme={theme} />;
      case BlockType.MAP:
        return <MapBlock config={block.config} theme={theme} />;
      case BlockType.TIMELINE:
        return <TimelineBlock config={block.config} theme={theme} />;
      case BlockType.VIDEO:
        return <VideoBlock config={block.config} theme={theme} />;
      case BlockType.TESTIMONIALS:
        return <TestimonialsBlock config={block.config} theme={theme} />;
      case BlockType.BROKER_CARD:
        // Note: Public view might not have access to 'useSettings' context provider if it's outside main App structure
        // But we pass null/undefined and let the block handle fallback or use saved config
        return <BrokerCardBlock config={block.config} theme={theme} settings={null} />; 
      case BlockType.DIVIDER:
        return <DividerBlock config={block.config} />;
      case BlockType.SPACER:
        return <SpacerBlock config={block.config} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-indigo-600" size={48} />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-4">
            {error || 'Página não encontrada'}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Voltar ao Início
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: page.themeConfig.fontFamily || 'sans-serif',
        backgroundColor: page.themeConfig.backgroundColor || '#ffffff',
        color: page.themeConfig.textColor || '#000000',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* SEO Meta Tags */}
      <title>{page.title}</title>
      <meta name="description" content={page.description} />
      {page.metaTitle && <meta property="og:title" content={page.metaTitle} />}
      {page.metaDescription && <meta property="og:description" content={page.metaDescription} />}
      {page.ogImage && <meta property="og:image" content={page.ogImage} />}

      {/* Preview Banner */}
      {isPreview && (
        <div className="bg-yellow-500 text-black px-4 py-2 text-center font-medium sticky top-0 z-50">
          🔍 MODO PREVIEW - Esta página ainda não está publicada
        </div>
      )}

      {/* Render all blocks */}
      <div className="flex-1">
        {page.blocks.map((block) => (
          <div 
            key={block.id} 
            style={block.styles}
            className={getContainerClass(block.containerWidth)}
          >
            {renderBlock(block)}
          </div>
        ))}
      </div>

      {/* Custom CSS */}
      {page.customCss && (
        <style dangerouslySetInnerHTML={{ __html: page.customCss }} />
      )}

      {/* Custom JS */}
      {page.customJs && (
        <script dangerouslySetInnerHTML={{ __html: page.customJs }} />
      )}
    </div>
  );
};

export default PublicLandingPage;
