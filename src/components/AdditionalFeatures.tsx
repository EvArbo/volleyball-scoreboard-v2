import { useState } from 'react'
import type { GameState} from "../types"

type AdditionalFeaturesProps = {
  gameState: GameState;
  setAutomaticRulesState: () => void;
  increaseSetsToWin: () => void;
  decreaseSetsToWin: () => void;
  increaseSetLength: () => void;
  decreaseSetLength: () => void;
  increaseFinalSetLength: () => void;
  decreaseFinalSetLength: () => void;
  saveGame: () => void;
  resetScores: () => void;
  resetMatch: () => void;
  getGame: () => void;
};

function AdditionalFeatures({
    gameState,
    setAutomaticRulesState,
    increaseSetsToWin,
  decreaseSetsToWin,
  increaseSetLength,
  decreaseSetLength,
  increaseFinalSetLength,
  decreaseFinalSetLength,
  saveGame,
  resetScores,
  resetMatch,
  getGame
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
            onClick={() => saveGame()}
        >
            Save Match
        </button>

        <button
            className="get-game-button"
            type="button"
            onClick={() => getGame()}
        >
            Get Match
        </button>
        
        <button
            className="reset-scores-button"
            type="button"
            onClick={() => resetScores()}
        >
            Reset Scores
        </button>

        <button
            className="reset-match-button"
            type="button"
            onClick={() => resetMatch()}
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
                    onClick={() => decreaseSetsToWin()}
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
                    onClick={() => increaseSetsToWin()}
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
                  onClick={() => decreaseSetLength()}
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
                  onClick={() => increaseSetLength()}
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
                  onClick={() => decreaseFinalSetLength()}
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
                  onClick={() => increaseFinalSetLength()}
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