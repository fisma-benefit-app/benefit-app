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
      <div className="max-w-[800px] my-8 mx-auto">
        <form name="FPFastCalculator" onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="platformList"
              className="block mb-2 font-medium text-[#333]"
            >
              Arkkitehtuuri
            </label>
            <select
              disabled
              id="platformList"
              name="platformList"
              className="w-full max-w-[200px] p-2 border bg-gray-400 border-[#ccc] rounded text-base"
            >
              <option value="4">Kolmikerroksinen</option>
              <option value="1">Koko sovellus yhdellä alustalla</option>
              <option value="2">Client-server, eristetty käyttöliittymä</option>
              <option value="3">Client server, eristetty tietokanta</option>
            </select>
          </div>

          <div className="mb-6">
            <h3>Toiminnallisuus</h3>

            <div className="flex items-center gap-4 mb-4">
              <input
                type="number"
                id="numQuery"
                name="numQuery"
                value={quickCalculationData.numQuery}
                min="0"
                onChange={handleChange}
                className="w-full max-w-[200px] shrink-0 p-2 border border-[#ccc] bg-white rounded text-base"
              />
              <label
                htmlFor="numQuery"
                className="block m-0 font-normal text-[#333]"
              >
                kpl hakunäyttöjä, joita ei päivitetä
              </label>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <input
                type="number"
                id="numInput"
                name="numInput"
                value={quickCalculationData.numInput}
                min="0"
                onChange={handleChange}
                className="w-full max-w-[200px] shrink-0 p-2 border border-[#ccc] bg-white rounded text-base"
              />
              <label
                htmlFor="numInput"
                className="block m-0 font-normal text-[#333]"
              >
                kpl päivitysnäyttöjä
              </label>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <input
                type="number"
                id="numOutput"
                name="numOutput"
                value={quickCalculationData.numOutput}
                min="0"
                onChange={handleChange}
                className="w-full max-w-[200px] shrink-0 p-2 border border-[#ccc] bg-white rounded text-base"
              />
              <label
                htmlFor="numOutput"
                className="block m-0 font-normal text-[#333]"
              >
                kpl raportteja ja muita tulosteita
              </label>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <input
                type="number"
                id="numIFaceTo"
                name="numIFaceTo"
                value={quickCalculationData.numIFaceTo}
                min="0"
                onChange={handleChange}
                className="w-full max-w-[200px] shrink-0 p-2 border border-[#ccc] bg-white rounded text-base"
              />
              <label
                htmlFor="numIFaceTo"
                className="block m-0 font-normal text-[#333]"
              >
                kpl liittymiä muihin järjestelmiin
              </label>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <input
                type="number"
                id="numIFaceFrom"
                name="numIFaceFrom"
                value={quickCalculationData.numIFaceFrom}
                min="0"
                onChange={handleChange}
                className="w-full max-w-[200px] shrink-0 p-2 border border-[#ccc] bg-white rounded text-base"
              />
              <label
                htmlFor="numIFaceFrom"
                className="block m-0 font-normal text-[#333]"
              >
                kpl liittymiä muista järjestelmistä
              </label>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <input
                type="number"
                id="numEntity"
                name="numEntity"
                value={quickCalculationData.numEntity}
                min="0"
                onChange={handleChange}
                className="w-full max-w-[200px] shrink-0 p-2 border border-[#ccc] bg-white rounded text-base"
              />
              <label
                htmlFor="numEntity"
                className="block m-0 font-normal text-[#333]"
              >
                kpl käsitteitä tietomallissa
              </label>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <input
                type="number"
                id="numRule"
                name="numRule"
                value={quickCalculationData.numRule}
                min="0"
                onChange={handleChange}
                className="w-full max-w-[200px] shrink-0 p-2 border border-[#ccc] bg-white rounded text-base"
              />
              <label
                htmlFor="numRule"
                className="block m-0 font-normal text-[#333]"
              >
                kpl vaativia käsittelysääntöjä
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#1e73be] hover:bg-[#13517a] text-white py-3 px-8 border-0 rounded text-base cursor-pointer my-6"
          >
            Laske
          </button>
        </form>

        <div
          className="bg-[#f8f9fa] border-2 border-[#1e73be] rounded-lg p-6 mt-8 text-2xl font-bold text-[#1e73be] text-center"
          id="Tulosalue"
        >
          Toiminnallinen koko: {quickCalculationResult} fp
        </div>
      </div>
    </div>
  );
};

export default QuickCalculation;
