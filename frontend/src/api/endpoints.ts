const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface DepositRequest {
  leaf: string;
}

interface WithdrawRequest {
  leafIndex: number;
}

export interface DepositResponse {
  leafIndex: number;
  newRoot: string;
  currentRoot: string;
  merklePath: string[];
}

export interface WithdrawResponse {
  merkleRoot: string;
  merklePath: string[];
}

export async function initiateDeposit(
  data: DepositRequest,
): Promise<DepositResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tree/initiate-deposit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error initiating deposit:", error);
    throw error;
  }
}

export async function initiateWithdraw(
  data: WithdrawRequest,
): Promise<WithdrawResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tree/initiate-withdraw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error initiating withdraw:", error);
    throw error;
  }
}
