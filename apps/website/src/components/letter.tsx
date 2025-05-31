import { Card } from '@tegonhq/ui';
import { Container } from './utils';

export const Letter = () => {
  return (
    <section className="w-full py-12 md:py-16 lg:py-20">
      <Container className="flex flex-col items-center">
        <Card className="w-full max-w-5xl mx-auto p-6 md:p-8 lg:p-12 bg-background border-border shadow-lg rounded-2xl">
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12">
            {/* Left side - Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2 md:mb-3">
                A LETTER
              </div>
              
              {/* Title */}
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-blue-600 mb-4 md:mb-6 lg:mb-8">
                From the team
              </h2>
              
              {/* Content paragraphs */}
              <div className="space-y-4 md:space-y-6 mb-6 md:mb-8 lg:mb-10">
                <p className="text-sm md:text-base lg:text-lg text-foreground leading-relaxed">
                The way we work, interact with tools, and find information is changing fast.
                Now you can focus on what truly matters—and offload the rest to your assistant.
                </p>
                
                <p className="text-sm md:text-base lg:text-lg text-foreground leading-relaxed">
                We believe everyone will have their own personalized Jarvis.
                Sigma exists to make that vision real.
                </p>
              </div>
              
              {/* Signature section */}
              <div className="flex items-center gap-3 md:gap-4">
                {/* Team avatars */}
                <div className="flex -space-x-1 md:-space-x-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-background flex items-center justify-center">
                    <span className="text-white text-xs md:text-sm font-semibold">H</span>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-background flex items-center justify-center">
                    <span className="text-white text-xs md:text-sm font-semibold">M</span>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-background flex items-center justify-center">
                    <span className="text-white text-xs md:text-sm font-semibold">R</span>
                  </div>
                </div>
                
                {/* Company and names */}
                <div>
                  <div className="font-semibold text-foreground text-sm md:text-base">Sigma Team</div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Harshith Mullapudi, Manik Aggarwal,Manoj Reddy
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Decorative icon */}
            <div className="flex-shrink-0 flex justify-center lg:justify-end items-start pt-4 lg:pt-0">
              <div className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-200 flex items-center justify-center">
                <div className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <svg 
                    className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 text-white" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </section>
  );
}; 