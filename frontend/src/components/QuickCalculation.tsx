import { FormEvent, useState } from "react";

const QuickCalculation = () => {
  type QuickCalculationType = {
    numQuery: string;
    numInput: string;
    numOutput: string;
    numIFaceTo: string;
    numIFaceFrom: string;
    numEntity: string;
    numRule: string;
  };

  const [quickCalculationData, setQuickCalculationData] =
    useState<QuickCalculationType>({
      numQuery: "",
      numInput: "",
      numOutput: "",
      numIFaceTo: "",
      numIFaceFrom: "",
      numEntity: "",
      numRule: "",
    });
  const [quickCalculationResult, setQuickCalculationResult] =
    useState<number>(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setQuickCalculationData({ ...quickCalculationData, [name]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    countTotalSize();
  };

  // FiSMA Pikalaskuri JavaScript
  function countTotalSize() {
    let fpSize = 0;
    //currently spec is that only mla is needed
    const platformSelection = 4;
    let numQuery = 0;
    let numInput = 0;
    let numOutput = 0;
    let numIFaceTo = 0;
    let numIFaceFrom = 0;
    let numEntity = 0;
    let numRule = 0;

    const SingleQrySize = countQuerySize(0.2, 12, 7, 2, 2);
    const SingleInpSize = countInputSize(2, 0.2, 12, 5, 2, 1.5, 1, 2);
    const SingleOutSize = countOutputSize(1, 20, 5, 3, 2);
    const SingleIFToSize = countIFaceToSize(0.5, 15, 7, 2, 2);
    const SingleIFFromSize = countIFaceFromSize(0.2, 15, 5, 2, 1.5, 1, 2);
    const SingleEntSize = countEntitySize(1.5, 12, 4);
    const SingleRuleSize = countRuleSize(0.1, 10, 5, 9, 3);
    let architectureMsgSize = 0;

    numQuery = parseInt(quickCalculationData.numQuery) || 0;
    numInput = parseInt(quickCalculationData.numInput) || 0;
    numOutput = parseInt(quickCalculationData.numOutput) || 0;
    numIFaceTo = parseInt(quickCalculationData.numIFaceTo) || 0;
    numIFaceFrom = parseInt(quickCalculationData.numIFaceFrom) || 0;
    numEntity = parseInt(quickCalculationData.numEntity) || 0;
    numRule = parseInt(quickCalculationData.numRule) || 0;

    fpSize = fpSize + SingleQrySize * numQuery;
    fpSize = fpSize + SingleInpSize * numInput;
    fpSize = fpSize + SingleOutSize * numOutput;
    fpSize = fpSize + SingleIFToSize * numIFaceTo;
    fpSize = fpSize + SingleIFFromSize * numIFaceFrom;
    fpSize = fpSize + SingleEntSize * numEntity;
    fpSize = fpSize + SingleRuleSize * numRule;

    architectureMsgSize = countLayerMsgSize(
      platformSelection,
      numQuery,
      numInput,
      numEntity,
      SingleIFToSize,
      SingleIFFromSize,
    );
    fpSize = fpSize + architectureMsgSize;
    setQuickCalculationResult(Math.round(fpSize));
  }

  function countQuerySize(
    cEstQ: number,
    nDataElemQ: number,
    cDataElemQ: number,
    nReadRefQ: number,
    cReadRefQ: number,
  ) {
    const QuerySize = cEstQ + nDataElemQ / cDataElemQ + nReadRefQ / cReadRefQ;
    return QuerySize;
  }

  function countInputSize(
    nFunc: number,
    cEstI: number,
    nDataElemI: number,
    cDataElemI: number,
    nReadRefI: number,
    cReadRefI: number,
    nWriteRefI: number,
    cWriteRefI: number,
  ) {
    const InputSize =
      nFunc *
      (cEstI +
        nDataElemI / cDataElemI +
        nReadRefI / cReadRefI +
        nWriteRefI / cWriteRefI);
    return InputSize;
  }

  function countOutputSize(
    cEstO: number,
    nDataElemO: number,
    cDataElemO: number,
    nReadRefO: number,
    cReadRefO: number,
  ) {
    const OutputSize = cEstO + nDataElemO / cDataElemO + nReadRefO / cReadRefO;
    return OutputSize;
  }

  function countIFaceToSize(
    cEstIt: number,
    nDataElemIt: number,
    cDataElemIt: number,
    nReadRefIt: number,
    cReadRefIt: number,
  ) {
    const IFaceToSize =
      cEstIt + nDataElemIt / cDataElemIt + nReadRefIt / cReadRefIt;
    return IFaceToSize;
  }

  function countIFaceFromSize(
    cEstIf: number,
    nDataElemIf: number,
    cDataElemIf: number,
    nReadRefIf: number,
    cReadRefIf: number,
    nWriteRefIf: number,
    cWriteRefIf: number,
  ) {
    const IFaceFromSize =
      cEstIf +
      nDataElemIf / cDataElemIf +
      nReadRefIf / cReadRefIf +
      nWriteRefIf / cWriteRefIf;
    return IFaceFromSize;
  }

  function countEntitySize(
    cEstEnt: number,
    nDataElemEnt: number,
    cDataElemEnt: number,
  ) {
    const EntitySize = cEstEnt + nDataElemEnt / cDataElemEnt;
    return EntitySize;
  }

  function countRuleSize(
    cEstR: number,
    nDataElemR: number,
    cDataElemR: number,
    nOperR: number,
    cOperR: number,
  ) {
    const RuleSize = cEstR + nDataElemR / cDataElemR + nOperR / cOperR;
    return RuleSize;
  }

  function countLayerMsgSize(
    platformSel: number,
    nQry: number,
    nInp: number,
    nEnt: number,
    IFToSize: number,
    IFFromSize: number,
  ) {
    if (platformSel == 2) {
      // Client-server with isolated UI
      return 2 * (nQry + nInp) * IFToSize + 2 * (nQry + nInp) * IFFromSize;
    } else if (platformSel == 3) {
      // Client-server with isolated DB
      return 2 * nEnt * (IFToSize + IFFromSize);
    } else if (platformSel == 4) {
      // Multi-layer platform (3-tier architecture)
      return 2 * (nQry + nInp + nEnt) * (IFToSize + IFFromSize);
    } else {
      return 0;
    }
  }

  return (
    <div className="pt-24">
      <div className="calculator-form">
        <form name="FPFastCalculator" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="platformList">Arkkitehtuuri</label>
            <select id="platformList" name="platformList">
              <option value="1">Koko sovellus yhdellä alustalla</option>
              <option value="2">Client-server, eristetty käyttöliittymä</option>
              <option value="3">Client server, eristetty tietokanta</option>
              <option value="4">Kolmikerroksinen</option>
            </select>
          </div>

          <div className="form-group">
            <h3>Toiminnallisuus</h3>

            <div className="input-with-label">
              <input
                type="number"
                id="numQuery"
                name="numQuery"
                value={quickCalculationData.numQuery}
                min="0"
                onChange={handleChange}
              />
              <label htmlFor="numQuery">
                kpl hakunäyttöjä, joita ei päivitetä
              </label>
            </div>

            <div className="input-with-label">
              <input
                type="number"
                id="numInput"
                name="numInput"
                value={quickCalculationData.numInput}
                min="0"
                onChange={handleChange}
              />
              <label htmlFor="numInput">kpl päivitysnäyttöjä</label>
            </div>

            <div className="input-with-label">
              <input
                type="number"
                id="numOutput"
                name="numOutput"
                value={quickCalculationData.numOutput}
                min="0"
                onChange={handleChange}
              />
              <label htmlFor="numOutput">
                kpl raportteja ja muita tulosteita
              </label>
            </div>

            <div className="input-with-label">
              <input
                type="number"
                id="numIFaceTo"
                name="numIFaceTo"
                value={quickCalculationData.numIFaceTo}
                min="0"
                onChange={handleChange}
              />
              <label htmlFor="numIFaceTo">
                kpl liittymiä muihin järjestelmiin
              </label>
            </div>

            <div className="input-with-label">
              <input
                type="number"
                id="numIFaceFrom"
                name="numIFaceFrom"
                value={quickCalculationData.numIFaceFrom}
                min="0"
                onChange={handleChange}
              />
              <label htmlFor="numIFaceFrom">
                kpl liittymiä muista järjestelmistä
              </label>
            </div>

            <div className="input-with-label">
              <input
                type="number"
                id="numEntity"
                name="numEntity"
                value={quickCalculationData.numEntity}
                min="0"
                onChange={handleChange}
              />
              <label htmlFor="numEntity">kpl käsitteitä tietomallissa</label>
            </div>

            <div className="input-with-label">
              <input
                type="number"
                id="numRule"
                name="numRule"
                value={quickCalculationData.numRule}
                min="0"
                onChange={handleChange}
              />
              <label htmlFor="numRule">kpl vaativia käsittelysääntöjä</label>
            </div>
          </div>

          <button type="submit" className="calculate-btn">
            Laske
          </button>
        </form>

        <div className="result-box" id="Tulosalue">
          Toiminnallinen koko: {quickCalculationResult} fp
        </div>
      </div>
    </div>
  );
};

export default QuickCalculation;
