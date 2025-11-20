import React, { useState } from 'react';
import type { JCardData, JCardStep, FontSettings } from '../types/editor';
import { CassetteCoverEditor } from './CassetteCoverEditor';
import { SpineEditor } from './SpineEditor';
import { FlapEditor } from './FlapEditor';
import { JCardPreviewStep } from './JCardPreviewStep';
import './JCardWizard.css';

interface JCardWizardProps {
  onBack: () => void;
  onComplete: (data: JCardData) => void;
}

const DEFAULT_FONT: FontSettings = {
  family: 'Arial',
  size: 32,
  weight: '700',
};

const INITIAL_DATA: JCardData = {
  cover: {
    image: null,
    albumName: '',
    font: DEFAULT_FONT,
    textColor: '#FFFFFF',
  },
  spine: {
    artistName: '',
    albumName: '',
    backgroundColor: '#808080',
    font: DEFAULT_FONT,
    textColor: '#FFFFFF',
  },
  flap: {
    albumName: '',
    sideA: [],
    sideB: [],
  },
};

export const JCardWizard: React.FC<JCardWizardProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState<JCardStep>('cover');
  const [data, setData] = useState<JCardData>(INITIAL_DATA);

  const handleCoverChange = (coverData: JCardData['cover']) => {
    setData({ ...data, cover: coverData });
  };

  const handleSpineChange = (spineData: JCardData['spine']) => {
    setData({ ...data, spine: spineData });
  };

  const handleFlapChange = (flapData: JCardData['flap']) => {
    setData({ ...data, flap: flapData });
  };

  const handleNext = () => {
    if (step === 'cover') {
      setStep('spine');
    } else if (step === 'spine') {
      setStep('flap');
    } else if (step === 'flap') {
      setStep('preview');
    } else if (step === 'preview') {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (step === 'spine') {
      setStep('cover');
    } else if (step === 'flap') {
      setStep('spine');
    } else if (step === 'preview') {
      setStep('flap');
    }
  };

  return (
    <div className="jcard-wizard">
      <div className="wizard-header">
        {step !== 'cover' && (
          <button className="wizard-back-button" onClick={onBack}>
            ← 처음으로
          </button>
        )}
        <div className="wizard-steps">
          <div className={`wizard-step ${step === 'cover' ? 'active' : step === 'spine' || step === 'flap' || step === 'preview' ? 'completed' : ''}`}>
            <div className="wizard-step-number">1</div>
            <div className="wizard-step-label">Cover</div>
          </div>
          <div className={`wizard-step ${step === 'spine' ? 'active' : step === 'flap' || step === 'preview' ? 'completed' : ''}`}>
            <div className="wizard-step-number">2</div>
            <div className="wizard-step-label">Spine</div>
          </div>
          <div className={`wizard-step ${step === 'flap' ? 'active' : step === 'preview' ? 'completed' : ''}`}>
            <div className="wizard-step-number">3</div>
            <div className="wizard-step-label">Flap</div>
          </div>
          <div className={`wizard-step ${step === 'preview' ? 'active' : ''}`}>
            <div className="wizard-step-number">4</div>
            <div className="wizard-step-label">Preview</div>
          </div>
        </div>
      </div>

      <div className="wizard-content">
        {step === 'cover' && (
          <CassetteCoverEditor
            data={data.cover}
            onChange={handleCoverChange}
            onNext={handleNext}
          />
        )}
        {step === 'spine' && (
          <SpineEditor
            data={data.spine}
            coverDominantColor={data.cover.dominantColor}
            coverAlbumName={data.cover.albumName}
            onChange={handleSpineChange}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}
        {step === 'flap' && (
          <FlapEditor
            data={data.flap}
            coverData={data.cover}
            spineData={data.spine}
            coverAlbumName={data.cover.albumName}
            onChange={handleFlapChange}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}
        {step === 'preview' && (
          <JCardPreviewStep data={data} onBack={handleBack} onComplete={handleNext} />
        )}
      </div>
    </div>
  );
};

