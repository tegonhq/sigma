import { Footer, Header } from '../components';
import { Manifesto } from '../components/manifesto';

const ManifestoPage = () => {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0F1019' }}>
      <Header />
      <main className="flex-1">
        <Manifesto />
      </main>
      <Footer />
    </div>
  );
};

export default ManifestoPage; 