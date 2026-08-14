import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { HashRouter as Router, Route, Routes } from 'react-router-dom'; // Changed to HashRouter for EXE stability
import PageNotFound from './lib/PageNotFound';
import Export from "./pages/Export";

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  // --- TITAN EXE BYPASS ---
  // We remove the cloud Auth check here because the backend is local.
  // This stops the 405/404 logging errors.

  return (
    <Routes>
      {/* 1. Root Route */}
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />

      {/* 2. MANUAL EXPORT ROUTE */}
      <Route path="/export" element={
        <LayoutWrapper currentPageName="export">
          <Export />
        </LayoutWrapper>
      } />

      {/* 3. Dynamic Routes from pagesConfig */}
      {Object.entries(Pages).map(([path, Page]) => {
        if (path === 'export') return null;
        return (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        );
      })}

      {/* 4. Wildcard */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      {/* Using HashRouter is much safer for EXEs because it doesn't 
          require the FastAPI server to handle complex URL rewrites. 
      */}
      <Router>
        <AuthenticatedApp />
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App