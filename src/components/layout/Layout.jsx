import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const { businessId } = useParams();
  const { setCurrentBusinessId } = useApp();

  useEffect(() => {
    if (businessId) setCurrentBusinessId(businessId);
  }, [businessId, setCurrentBusinessId]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <TopBar />
      <div style={{ display: 'flex', paddingTop: 'var(--topbar-height)' }}>
        <Sidebar />
        <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, minHeight: 'calc(100vh - var(--topbar-height))', background: 'var(--white)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
