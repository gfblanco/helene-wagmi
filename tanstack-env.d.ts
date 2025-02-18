type TanstackQuery = {
  onSuccess?: (data: unknown = undefined) => void
  onError?: (error: JsonRpcError | ContractError) => void
}
