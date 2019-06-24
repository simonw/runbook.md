module.exports = `# This is the name of the system

Here is a long description of a system that contains the minimum detail that should be provided via a RUNBOOK.md file. The format includes the provision of text value, enum, single value and multiple value fields. Please try and avoid paragraphs as that longer content may belong in the other text fields which are contained below.

## primaryURL

https://www.sample.ft.com

## serviceTier

Bronze

## lifecycleStage

Preproduction

## hostPlatform

AWS

## deliveredBy

delivery-team

## supportedBy

support-team

## knownAboutBy

-   ex-team-member
-   another-ex-team-member

## stakeholders

-   stakeholder-one
-   stakeholder-two

## dataOwner

data-owner

## containsPersonalData

True

## containsSensitiveData

False

## repositories

-   source-code-repo
-   library-repo

## architecture

Here are some details about the architecture of the system.

## dependencies

-   sub-system-one
-   sub-system-two
-   sub-system-three

## dependents

-   parent-system-one
-   parent-system-two
-   parent-system-three

## replaces

-   previous-system

## failoverArchitectureType

ActiveActive

## failoverProcessType

FullyAutomated

## failbackProcessType

PartiallyAutomated

## failoverDetails

Please include some text, with paragraphs, to explain how the system is failed over and how to fail back.

Failover:

-   Step 1
-   Step 2
-   Step 3

Failback:

-   Step 1
-   Step 2
-   Step 3.

## dataRecoveryProcessType

Manual

## dataRecoveryDetails

Please include some text, with paragraphs, to explain how the system's data is restored after failure.

Restore:

-   Step 1
-   Step 2
-   Step 3

## releaseProcessType

FullyAutomated

## rollbackProcessType

Manual

## releaseDetails

Please include some text, with paragraphs, to explain how the system is released over and how to roll back.

Release:

-   Step 1
-   Step 2
-   Step 3

Rollback:

-   Step 1
-   Step 2
-   Step 3.

## keyManagementProcessType

PartiallyAutomated

## keyManagementDetails

Please include some text, with paragraphs, to explain how the system's keys are rotated.

Key Rotation:

-   Step 1
-   Step 2
-   Step 3

## bespokeMonitoring

Here I am indicating there there is no bespoke monitoring - instead of leaving the text blank

## healthchecks

-   system-eu-health
-   system-us-health

## firstLineTroubleshooting

Here are some details to explain how the **first line** support team can resolve issues with the system when it is running in production.
Feel free to use paragraphs and other formatting techniques.

## secondLineTroubleshooting

Here are some details to explain how the **second line** support team can resolve issues with the system when it is running in production.
Feel free to use paragraphs and other formatting techniques.

## moreInformation

This section should be used to capture and additional information that would otherwise have over extended the description or polluted the troucbleshooting.`;
