
import { writable } from "svelte/store"
import type Snackbar from "@smui/snackbar"

export default writable({
    success: undefined,
    error: undefined,
    warning: undefined
} as SnackbarStore)

export type SnackbarStore = {
    success: Snackbar | undefined,
    error: Snackbar | undefined,
    warning: Snackbar | undefined,
}
