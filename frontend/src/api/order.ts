import { getAccessToken } from "./state";
import { SHOPPING_URL } from "./config";

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const result = await response.json();

    if (result && typeof result.error === "string") {
      return result.error;
    };
  } catch {
    return "";
  };

  return "";
};

export async function createOrder() {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("Not authenticated");
  };

  const response = await fetch(`${SHOPPING_URL}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);

    throw new Error(message || "Failed to create order");
  };

  const order = await response.json();

  window.dispatchEvent(
    new CustomEvent("cartchange", {
      detail: {
        count: 0
      }
    })
  );

  return order;
};