function AdditionalFeatures() {
  return (
    <section className="additional-features">
      <button
          className="features-toggle-button"
          type="button"
          aria-expanded="false"
      >
          Additional Features
      </button>

      <div className="features-menu" hidden>
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
        >
        </button>

        <div className="configure-rules">
          <button
              className="configure-rules-button"
              type="button"
              aria-expanded="false"
          >
              Configure Rules ▲
          </button>

          <section
              className="rules-menu"
              hidden
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
        </div>
      </div>
    </section>
  )
}

export default AdditionalFeatures