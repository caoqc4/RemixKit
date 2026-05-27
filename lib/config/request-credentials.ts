const credentialsHeader = "x-remixkit-credentials";
const credentialsField = "remixkitCredentials";

export function readCredentialsFromFormData(formData: FormData) {
  return parseCredentialPayload(formData.get(credentialsField));
}

export function readCredentialsFromRequest(request: Request) {
  return parseCredentialPayload(request.headers.get(credentialsHeader));
}

function parseCredentialPayload(value: FormDataEntryValue | string | null) {
  if (typeof value !== "string" || !value.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>)
        .filter((entry): entry is [string, string] => typeof entry[1] === "string" && Boolean(entry[1].trim()))
        .map(([key, secret]) => [key, secret.trim()])
    );
  } catch {
    return {};
  }
}
