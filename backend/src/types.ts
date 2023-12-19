export enum DistributionState {
  StartEmpty = "",
  Start = "START",
  AwaitingAllowanceIncrease = "AWAITING_ALLOWANCE_INCREASE",
  AwaitingDistribution = "AWAITING_DISTRIBUTION",
  DoneSuccess = "DONE_SUCCESS",
  Failed = "FAILED",
}

export enum TreeRequestState {
  RequestReceived = "Request Received",
  RequestApproved = "Request Approved",
  PlantingComplete = "Planting Complete",
  VerifiedUnsent = "Verified Unsent",
  VerifiedSending = "Verified Sending",
  VerifiedSent = "Verified Sent",
}

export interface TreeRequest {

}
