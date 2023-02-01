import type Snackbar from "@smui/snackbar";

export const openSnackbar = function(snackbar: Snackbar | undefined, message: string){
    if (typeof snackbar?.open === "function") {
        const label = snackbar.getLabelElement()
        label.textContent = message
        snackbar.open();
    }
}