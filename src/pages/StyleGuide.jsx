// Reference page for the slip design. Open /style to see every class in use.
// Copy the markup you need into your own components.

export default function StyleGuide() {
  return (
    <>
      <div className="slip">
        <div className="slip-head">
          <span className="label">Slip No. <span className="entry">014</span></span>
          <span className="label">Bal <span className="entry">340</span></span>
        </div>

        <div className="boxes">
          <div className="box">
            <span className="label">Placed</span>
            <span className="entry">28/10</span>
          </div>
          <div className="box">
            <span className="label">Settles</span>
            <span className="entry">Fri 31/10</span>
          </div>
        </div>

        <div className="boxes">
          <div className="box tall">
            <span className="label">Selection</span>
            <span className="entry">Finish lesson 2 of the React course</span>
          </div>
        </div>

        <div className="boxes">
          <div className="box">
            <span className="label">Odds</span>
            <span className="entry">70%</span>
          </div>
          <div className="box">
            <span className="label">Stake</span>
            <span className="entry">50</span>
          </div>
          <div className="box">
            <span className="label">To return</span>
            <span className="entry">71</span>
          </div>
        </div>

        <div className="boxes">
          <div className="box">
            <span className="label"><span className="check">x</span>Task <span className="check" style={{ marginLeft: 12 }} />Call</span>
          </div>
          <div className="box">
            <span className="label"><span className="check" />Won <span className="check" style={{ marginLeft: 12 }} />Lost</span>
          </div>
        </div>

        <p className="fine-print">Odds are your own. Stakes are final once placed. The house is you.</p>
      </div>

      <div className="slip lost">
        <div className="slip-head">
          <span className="label">Slip No. <span className="entry">012</span></span>
          <span className="label">Lost</span>
        </div>
        <div className="boxes">
          <div className="box">
            <span className="label">Selection</span>
            <span className="entry">Rain on Saturday</span>
          </div>
        </div>
      </div>

      <div className="slip">
        <div className="slip-head">
          <span className="title">Make a call</span>
        </div>
        <div className="boxes">
          <label className="box tall">
            <span className="label">Selection</span>
            <textarea rows="2" placeholder="I'll finish the essay by Sunday" />
          </label>
        </div>
        <div className="boxes">
          <label className="box">
            <span className="label">Odds %</span>
            <input type="number" placeholder="70" />
          </label>
          <label className="box">
            <span className="label">Stake</span>
            <input type="number" placeholder="0" />
          </label>
          <label className="box">
            <span className="label">Settles</span>
            <input type="date" />
          </label>
        </div>
        <div className="actions">
          <button className="btn solid">Place it</button>
          <button className="btn">Cancel</button>
        </div>
      </div>
    </>
  )
}
