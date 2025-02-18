import { TGenericComponent } from "../lib/types";

//todo implement api calls for creating, saving, deleting functional component row data

const deleteCalculationRow = async () => {
    console.log("Clicking me should delete this row!");
}

const saveCalculationRow = async (component: TGenericComponent) => {
    console.log(component);
}

export {
    deleteCalculationRow,
    saveCalculationRow
}