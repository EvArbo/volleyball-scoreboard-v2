import { useState } from 'react'
import type { GameState} from "../types"

type AdditionalFeaturesProps = {
  gameState: GameState;
  setAutomaticRulesState: () => void;
};

function AdditionalFeatures({
    gameState,
    setAutomaticRulesState,
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
            className="reset-scores-button"
            type="button"
        >
            Reset Scores
        </button>

        <button
            className="reset-match-button"
            type="button"
        >
            Reset Match
        </button>

        <button
            className="auto-ruling-button"
            type="button"
            onClick={() => {setShowConfigureRules(!showConfigureRules);
                            setAutomaticRulesState();
            }}
        >
            Automatic Rules: 
            <span className="team-one-sets">{gameState.additionalFeatures.automaticRulesState}</span>
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
                >
                    -
                </button>

                <p>
                    Sets to Win:
                    <span className="sets-to-win-display"></span>
                </p>

                <button
                    className="rule-add-button"
                    type="button"
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
              >
                  -
              </button>

              <p>
                  Set Length:
                  <span className="set-length-display"></span>
              </p>

              <button
                  className="rule-add-button"
                  type="button"
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
              >
                  -
              </button>

              <p>
                  Final Set Length:
                  <span className="last-set-length-display"></span>
              </p>

              <button
                  className="rule-add-button"
                  type="button"
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