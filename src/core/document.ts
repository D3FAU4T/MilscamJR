import { dlopen, FFIType, ptr } from "bun:ffi";
import { outro } from "@clack/prompts";

let documentsPath: string | null = null;

export const getDocumentsPath = () => {

    if (process.platform !== 'win32') {
        outro("This application only runs on Windows and is unavailable on platform \`" + process.platform + "\`");
        process.exit(1);
    }

    if (documentsPath !== null) {
        return documentsPath;
    }

    // 1. Load the Windows Shell API
    const shell32 = dlopen("Shell32.dll", {
        SHGetFolderPathW: {
            args: [
                FFIType.ptr, // HWND hwnd
                FFIType.i32, // int csidl
                FFIType.ptr, // HANDLE hToken
                FFIType.u32, // DWORD dwFlags
                FFIType.ptr, // LPWSTR pszPath
            ],
            returns: FFIType.i32, // HRESULT
        },
    });

    // 2. Define Windows API constants
    const CSIDL_PERSONAL = 0x0005;     // Constant for the logical "My Documents" folder
    const SHGFP_TYPE_CURRENT = 0;      // Request the current path, not the default
    const MAX_PATH = 260;              // Standard Windows max path length

    // 3. Allocate a memory buffer for the path
    // Windows uses UTF-16LE, so we use a Uint16Array (2 bytes per character)
    const pathBuffer = new Uint16Array(MAX_PATH);

    // 4. Call the foreign function
    const hresult = shell32.symbols.SHGetFolderPathW(
        null,               // No window handle
        CSIDL_PERSONAL,     // Target folder
        null,               // No specific user token (current user)
        SHGFP_TYPE_CURRENT, // Current path flags
        ptr(pathBuffer)     // Pointer to our allocated buffer
    );

    // 5. Process the result
    if (hresult === 0) { // S_OK
        // Find the null terminator (0x0000) to know where the string ends
        const stringLength = pathBuffer.indexOf(0);
        const activeBuffer = stringLength !== -1 ? pathBuffer.subarray(0, stringLength) : pathBuffer;

        // Decode the UTF-16 buffer directly using Bun's native Buffer
        documentsPath = Buffer.from(activeBuffer.buffer, activeBuffer.byteOffset, activeBuffer.byteLength).toString("utf16le");

        return documentsPath;
    }
    
    else throw new Error(`Failed to retrieve documents path. HRESULT: ${hresult}`);
}