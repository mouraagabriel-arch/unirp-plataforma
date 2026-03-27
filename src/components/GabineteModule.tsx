import { ReactNode } from 'react';
import { GabineteDashboard } from './gabinete/GabineteDashboard';
import { GabineteInbox } from './gabinete/GabineteInbox';
import { GabineteProjetos } from './gabinete/GabineteProjetos';
import { GabineteArsenal } from './gabinete/GabineteArsenal';
import { GabinetePosicionamento } from './gabinete/GabinetePosicionamento';
import { GabineteIdeologia } from './gabinete/GabineteIdeologia';
import { GabineteHub } from './gabinete/GabineteHub';
import { GabineteCidadaos } from './gabinete/GabineteCidadaos';
import { GabinetePlanejamento } from './gabinete/GabinetePlanejamento';
import { GabineteWorkflow } from './gabinete/GabineteWorkflow';
import { GabinetePlan } from './gabinete/GabinetePlan';

interface GabineteModuleProps {
  activeTab: string;
  isDarkMode: boolean;
}

export function GabineteModule({ activeTab, isDarkMode }: GabineteModuleProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <GabineteDashboard isDarkMode={isDarkMode} />;
      case 'demandas':
        return <GabineteInbox isDarkMode={isDarkMode} />;
      case 'projetos':
        return <GabineteProjetos isDarkMode={isDarkMode} />;
      case 'arsenal':
        return <GabineteArsenal isDarkMode={isDarkMode} />;
      case 'posicionamento':
        return <GabinetePosicionamento isDarkMode={isDarkMode} />;
      case 'cerebro':
        return <GabineteIdeologia isDarkMode={isDarkMode} />;
      case 'hub':
        return <GabineteHub isDarkMode={isDarkMode} />;
      case 'crm':
        return <GabineteCidadaos isDarkMode={isDarkMode} />;
      case 'planejamento':
        return <GabinetePlanejamento isDarkMode={isDarkMode} />;
      case 'workflow':
        return <GabineteWorkflow isDarkMode={isDarkMode} />;
      case 'plano':
        return <GabinetePlan isDarkMode={isDarkMode} />;
      default:
        return <GabineteDashboard isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className="w-full h-full">
      {renderContent()}
    </div>
  );
}
