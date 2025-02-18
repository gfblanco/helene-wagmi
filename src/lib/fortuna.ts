import { FORTUNA_API_URL } from "@/lib/constants"

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  headers?: Record<string, string>
  body?: Record<string, unknown> | string
  queryParams?: Record<string, string>
}

async function fortunaRequest<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = "GET", headers = {}, body, queryParams } = options

  let url = `${FORTUNA_API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

  if (queryParams) {
    const queryString = new URLSearchParams(queryParams).toString()

    url += `?${queryString}`
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  }

  if (body && method !== "GET") {
    fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body)
  }

  const response = await fetch(url, fetchOptions)

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()

  return data as T
}

export const generateMessage = async () => {
  const data = await fortunaRequest<{ random_word: string; uuid: string }>("/generate_message")

  return {
    uuid: data.uuid,
    message: data.random_word,
  }
}

export const login = async (signature: string, uuid: string) => {
  const data = await fortunaRequest<{ access_token: string }>("/login", {
    method: "POST",
    body: {
      signature,
      uuid,
    },
  })

  return data.access_token
}

export const fortuna = async (token: string) => {
  const data = await fortunaRequest<{ password: string }>("/fortuna", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return data.password
}
