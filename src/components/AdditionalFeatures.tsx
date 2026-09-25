import { useState } from 'react'
import type { GameState} from "../types"

type AdditionalFeaturesProps = {
  gameState: GameState;
  handleToggleAutomaticRules: () => void;
  handleIncreaseSetsToWin: () => void;
  handleDecreaseSetsToWin: () => void;
  handleIncreaseSetLength: () => void;
  handleDecreaseSetLength: () => void;
  handleIncreaseFinalSetLength: () => void;
  handleDecreaseFinalSetLength: () => void;
  saveGame: (GameState) => void;
  handleResetCurrentSet: () => void;
  requestResetMatch: () => void;
  handleStartRecordMatch: () => void;
  handleStopRecordMatch: () => void;
};

function AdditionalFeatures({
    gameState,
    handleToggleAutomaticRules,
    handleIncreaseSetsToWin,
    handleDecreaseSetsToWin,
    handleIncreaseSetLength,
    handleDecreaseSetLength,
    handleIncreaseFinalSetLength,
    handleDecreaseFinalSetLength,
    saveGame,
    handleResetCurrentSet,
    requestResetMatch,
    handleStartRecordMatch,
    handleStopRecordMatch
}: AdditionalFeaturesProps) {
    const [showAdditionalFeatures, setShowAdditionalFeatures] = useState(false)
    const [showConfigureRules, setShowConfigureRules] = useState(false)
    const [showConfigureRulesAppendix, setShowConfigureRulesAppendix] = useState(false)
  return (
    <section className="additional-features">
      <button
          className="features-toggle-button"
          type="button"
          aria-expanded="false"
          onClick={() => setShowAdditionalFeatures(!showAdditionalFeatures)}
      >
          Additional Features
      </button>
      
      {showAdditionalFeatures &&
      <div className="features-menu">
        <button
            className="save-match-button"
            type="button"
            onClick={() => saveGame(gameState)}
        >
            Save Match
        </button>

        <button
            className="record-match-button"
            type="button"
            onClick={() => {
                if (!gameState.additionalFeatures.isMatchRecordingOn) {
                    const shouldReset = window.confirm(
                        "Press 'Ok' to reset match, configure new rules, and record match stats"
                    )

                    if (!shouldReset) {
                        return
                    }

                    handleStartRecordMatch()
                    setShowConfigureRules(true)
                    setShowConfigureRulesAppendix(true)
                } else {
                    // toggling from "On" to "Off"
                    handleStopRecordMatch()
                    setShowConfigureRules(false)
                    setShowConfigureRulesAppendix(false)
                }
            }}
        >
            Record Match: 
            <span className="record-match">{gameState.additionalFeatures.isMatchRecordingOn ? 'On' : 'Off'}</span>
        </button>
        
        <button
            className="reset-scores-button"
            type="button"
            onClick={() => handleResetCurrentSet()}
        >
            Reset Scores
        </button>

        <button
            className="reset-match-button"
            type="button"
            onClick={() => requestResetMatch()}
        >
            Reset Match
        </button>

        <button
            className="auto-ruling-button"
            type="button"
            onClick={() => {setShowConfigureRules(!showConfigureRules);
                            handleToggleAutomaticRules();
            }}
        >
            Automatic Rules: 
            <span className="automatic-rules">{gameState.additionalFeatures.isAREnabled ? 'On' : 'Off'}</span>
        </button>

        {showConfigureRules &&
        <div className="configure-rules">
          <button
              className="configure-rules-button"
              type="button"
              aria-expanded="false"
              onClick={() => setShowConfigureRulesAppendix(!showConfigureRulesAppendix)}
          >
              Configure Rules ▲
          </button>
          
          {showConfigureRulesAppendix &&
          <section
              className="rules-menu"
          >
            <div
                className="rule-control"
                data-rule="setsToWin"
            >
                <button
                    className="rule-subtract-button"
                    type="button"
                    onClick={() => handleDecreaseSetsToWin()}
                >
                    -
                </button>

                <p>
                    Sets to Win:
                    <span className="sets-to-win-display">{gameState.additionalFeatures.setsToWin}</span>
                </p>

                <button
                    className="rule-add-button"
                    type="button"
                    onClick={() => handleIncreaseSetsToWin()}
                >
                    +
                </button>
            </div>

            <div
                className="rule-control"
                data-rule="setLength"
            >
              <button
                  className="rule-subtract-button"
                  type="button"
                  onClick={() => handleDecreaseSetLength()}
              >
                  -
              </button>

              <p>
                  Set Length:
                  <span className="set-length-display">{gameState.additionalFeatures.setLength}</span>
              </p>

              <button
                  className="rule-add-button"
                  type="button"
                  onClick={() => handleIncreaseSetLength()}
              >
                  +
              </button>
            </div>

            <div
                className="rule-control"
                data-rule="lastSetLength"
            >
              <button
                  className="rule-subtract-button"
                  type="button"
                  onClick={() => handleDecreaseFinalSetLength()}
              >
                  -
              </button>

              <p>
                  Final Set Length:
                  <span className="last-set-length-display">{gameState.additionalFeatures.finalSetLength}</span>
              </p>

              <button
                  className="rule-add-button"
                  type="button"
                  onClick={() => handleIncreaseFinalSetLength()}
              >
                  +
              </button>
            </div>
          </section>
          }
        </div>
        }
      </div>
      }
    </section>
  )
}

export default AdditionalFeatures