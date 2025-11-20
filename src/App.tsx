import { useState } from 'react';
import type { Template, JCardData } from './types/editor';
import { TemplateSelector } from './components/TemplateSelector';
import { JCardWizard } from './components/JCardWizard';
import { JCardPreview } from './components/JCardPreview';
import { LabelEditor } from './components/LabelEditor';
import './App.css';

type View = 'selector' | 'jcard-wizard' | 'jcard-preview' | 'label';

function App() {
  const [currentView, setCurrentView] = useState<View>('jcard-wizard');
  const [jcardData, setJcardData] = useState<JCardData | null>(null);

  const handleSelectTemplate = (template: Template) => {
    if (template.type === 'jcard') {
      setCurrentView('jcard-wizard');
    } else {
      setCurrentView('label');
    }
  };

  const handleBack = () => {
    setCurrentView('jcard-wizard');
  };

  const handleJCardComplete = (data: JCardData) => {
    setJcardData(data);
    setCurrentView('jcard-preview');
  };

  const handlePreviewBack = () => {
    setCurrentView('jcard-wizard');
  };

  return (
    <div className="app">
      {currentView === 'selector' && (
        <TemplateSelector onSelectTemplate={handleSelectTemplate} />
      )}
      {currentView === 'jcard-wizard' && (
        <JCardWizard onBack={handleBack} onComplete={handleJCardComplete} />
      )}
      {currentView === 'jcard-preview' && jcardData && (
        <JCardPreview data={jcardData} onBack={handlePreviewBack} />
      )}
      {currentView === 'label' && <LabelEditor onBack={handleBack} />}
    </div>
  );
}

export default App;
