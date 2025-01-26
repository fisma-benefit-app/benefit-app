const CalculationDemo = () => {
  return (
    //form form collecting calculation data
    <form className='flex gap-10 justify-center flex-wrap'>
      <div className="flex flex-col gap-5 items-center">
        <label htmlFor="baseFunctionalComponentClass">Base Functional Component Class</label>
        <select className="border-2 rounded-2xl px-4 py-2 w-48" id="baseFunctionalComponentClass">
          <option value="test">test</option>
        </select>
      </div>

      <div className="flex flex-col gap-5 items-center">
        <label htmlFor="baseFunctionalComponentType">Base Functional Component Type</label>
        <select className="border-2 rounded-2xl px-4 py-2 w-48" id="baseFunctionalComponentType">
          <option value="test">test</option>
        </select>
      </div>

      <div className="flex flex-col gap-5 items-center">
        <label htmlFor="dataElements">Data elements</label>
        <input className="border-2 rounded-2xl px-4 py-2 w-48" type="number" id="dataElements" defaultValue="1" />
      </div>

      <div className="flex flex-col gap-5 items-center">
        <label htmlFor="readingReferences">Reading References</label>
        <input className="border-2 rounded-2xl px-4 py-2 w-48" type="number" id="readingReferences" defaultValue="1" />
      </div>

      <div className="flex flex-col gap-5 items-center">
        <label htmlFor="writingReferences">Writing References</label>
        <input className="border-2 rounded-2xl px-4 py-2 w-48" type="number" id="writingReferences" defaultValue="1" />
      </div>

      <div className="flex flex-col gap-5 items-center">
        <label htmlFor="functionalityMultiplier">Functionality Multiplier</label>
        <input className="border-2 rounded-2xl px-4 py-2 w-48" type="number" id="functionalityMultiplier" defaultValue="1" />
      </div>
    </form>
  )
}

export default CalculationDemo