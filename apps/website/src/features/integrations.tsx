import { TaskItemBig } from '../components/utils';
import Image from 'next/image';

export const Integrations = () => {
  return (
    <section id="integrations-section" className="w-full py-24 lg:py-32 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">

        {/* Main heading */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-[46px] lg:text-5xl xl:text-6xl font-bold text-[#efead7] mb-8 tracking-tight">
            Integrations that listen in real time
          </h2>
        </div>

        {/* Responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Mars Rover Image - Full width on mobile, left column on desktop */}
          <div className="lg:col-span-4 flex justify-center lg:justify-start">
            <div className="max-w-xs lg:max-w-none lg:-mt-8">
              <Image 
                src="/mars_rover.svg" 
                alt="Mars Rover" 
                width={320} 
                height={240}
                className="w-full h-auto opacity-90"
              />
            </div>
          </div>

          {/* Content area - spans remaining columns */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* How SOL ingests data */}
            <div className="space-y-8">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-6">How SOL ingests data</h3>
              
              {/* Webhooks section */}
              <div className="space-y-4">
                <h4 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></span>
                  Webhooks <span className="text-gray-400 font-normal text-lg">(instant)</span>
                </h4>
                <div className="space-y-2 text-white/90 text-lg leading-relaxed pl-6">
                  <p>Tools like Linear and Slack ping</p>
                                     <p>SOL the moment something&apos;s</p>
                  <p>assigned, or mentioned.</p>
                  <p className="font-medium">Rules run right away.</p>
                </div>
              </div>

              {/* Smart polling section */}
              <div className="space-y-4">
                <h4 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></span>
                  Smart polling <span className="text-gray-400 font-normal text-lg">(≈30 min)</span>
                </h4>
                <div className="space-y-2 text-white/90 text-lg leading-relaxed pl-6">
                  <p>For APIs without webhooks, SOL</p>
                  <p>checks every half-hour to stay</p>
                  <p>nearly real-time.</p>
                </div>
              </div>
            </div>

            {/* Out-of-the-box & Open platform */}
            <div className="space-y-8">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-6">Out-of-the-box</h3>
              
              {/* Integration grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  'Claude Code', 'Gmail', 'Linear', 'Slack', 'Google Docs', 'Google Sheets'
                ].map((integration) => (
                  <div key={integration} className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
                    <span className="text-white/90 text-lg">{integration}</span>
                  </div>
                ))}
              </div>

              {/* Open platform section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl lg:text-3xl font-bold text-white">Open platform</h3>
                  <span className="px-3 py-1 bg-transparent border border-orange-500 text-orange-500 text-sm font-mono rounded-md">
                    MCP
                  </span>
                </div>
                <div className="space-y-2 text-white/90 text-lg leading-relaxed">
                  <p>Connect any service via</p>
                  <p>Model Context Protocol (MCP)</p>
                </div>
              </div>

              {/* Browse integrations button */}
              <div className="pt-4">
                <button className="px-6 py-3 bg-transparent border-2 border-orange-500 text-orange-500 font-semibold rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-200 hover:shadow-lg">
                  Browse all integrations
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integrations;