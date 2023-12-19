import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useAsyncEffect from "../utilities/useAsyncEffect";
import { TreeRequestState } from "./types";
import RequestDetailForm from "./RequestDetailForm";
import { Button } from "@mui/material";

export default function Request() {
  const { requestId } = useParams();
  const [requestFields, setRequestFields] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [createDistributionPending, setCreateDistributionPending] =
    useState<boolean>(false);
  const [createdLabel, setCreatedLabel] = useState<string>("");

  const [verificationUpdating, setVerificationUpdating] = useState<boolean>(false);

  useAsyncEffect(async () => {
    const response = await fetch(
      `${
        process.env.REACT_APP_SERVER_BASE_URL || ""
      }/api/tree-requests?recordId=${requestId}`
    );
    const responseJson = await response.json();
    if (responseJson.error) {
      console.log(responseJson.error);
      setError(`Error loading tree request : ${responseJson.error}`);
      return;
    }

    setRequestFields(responseJson.record.fields);
  }, []);

  const renderRequestFields = () => {
    const onVerifyPlanted = async () => {
      setVerificationUpdating(true);
      try {
        const response = await fetch(
          `${
            process.env.REACT_APP_SERVER_BASE_URL || ""
          }/api/verify-request`,
          {
            method: "POST",
            body: JSON.stringify({ treeRequestRecordId: requestId }),
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        const responseJson = await response.json();
        if (responseJson.error) {
          throw new Error(responseJson.error);
        }

        setRequestFields(responseJson.record.fields);
      } catch (err: any) {
        console.log(err);
        // TODO(mgraczyk): Show error.
      } finally {
        setVerificationUpdating(false);
      }
    };

    let verifiedButton;
    switch (requestFields.Status) {
      case TreeRequestState.RequestReceived:
      case TreeRequestState.RequestApproved:
        verifiedButton = <Button disabled>Not ready for verification</Button>;
        break;
      case TreeRequestState.PlantingComplete:
        if (verificationUpdating) {
          verifiedButton = <Button disabled>Verifying...</Button>;
        } else {
          verifiedButton = <Button onClick={onVerifyPlanted}>Verify Tree Planted</Button>;
        }
        break;
      default:
        verifiedButton = <Button disabled>Verified</Button>;
        break;
    }

    const onCreateDistribution = async () => {
      setCreatedLabel("");
      setCreateDistributionPending(true);
      setError(null);
      try {
        const response = await fetch(
          `${
            process.env.REACT_APP_SERVER_BASE_URL || ""
          }/api/create-distribution`,
          {
            method: "POST",
            body: JSON.stringify({ treeRequestRecordId: requestId }),
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        const responseJson = await response.json();
        if (responseJson.error) {
          throw new Error(responseJson.error);
        }

        setCreatedLabel("Created");
        setRequestFields(responseJson.record.fields);
      } catch (err: any) {
        console.log(err);
        setError(`Error creating distribution: ${err}`);
        return;
      } finally {
        setCreateDistributionPending(false);
      }
    };

    const isInReadyState = requestFields.Status === TreeRequestState.VerifiedUnsent;
    const isInDistributingState = requestFields.Status === TreeRequestState.VerifiedSending;
    const isInDistributedState = requestFields.Status === TreeRequestState.VerifiedSent;
    const hasDistribution = !!requestFields.distributionRecordId;

    let distributeButton;
    let errorMessage =
      error ||
      (isInReadyState && hasDistribution
        ? "State mismatch, is ready to distribution but already has a distribution"
        : "");
    if (isInReadyState) {
      distributeButton = (
        <Button
          disabled={createDistributionPending || hasDistribution}
          onClick={onCreateDistribution}
        >
          {hasDistribution
            ? "Created"
            : createDistributionPending
            ? "Creating..."
            : "Create Distribution"}
        </Button>
      );
    } else if (isInDistributingState) {
      distributeButton = <Button disabled>Sending Distribution</Button>;
    } else if (isInDistributedState) {
      distributeButton = <Button disabled>Done Distributing</Button>;
    } else {
      distributeButton = <Button disabled>Cannot distribute, not ready</Button>;
    }

    return (
      <div>
        <RequestDetailForm contents={requestFields} />
        {verifiedButton}
        {distributeButton}
      </div>
    );
  };

  return (
    <div style={{ padding: "2em" }}>
      <h3>Tree Request ({requestId})</h3>
      {requestFields === null ? "loading" : renderRequestFields()}
      <div style={{ color: "green" }}>{createdLabel}</div>
      <div style={{ color: "red" }}>{error || ""}</div>
    </div>
  );
}
