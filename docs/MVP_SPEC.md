# MVP Spec

## Goal

Build a lightweight prototype that proves whether serious founders and credible builders can be matched into fair paid 7-day trial sprints.

## MVP Success Question

Can the platform create a match where:

- the founder has a specific need and budget
- the builder has credible proof and a compatible minimum rate
- both sides agree to a scoped 7-day trial
- the builder submits evidence of work
- both sides can decide whether to continue

## Primary Workflows

### 1. Founder Onboarding

Founder provides:

- name
- timezone/location
- project summary
- target customer or market
- skill needed
- trial budget
- expected 7-day outcome
- current project stage
- relevant links

Founder seriousness fields:

- budget exists
- timeline exists
- scope is specific
- market evidence exists
- founder can provide context and feedback during the trial

### 2. Builder Onboarding

Builder provides:

- name
- timezone/location
- status: unemployed, underemployed, freelance, employed but available, student, other
- skills
- minimum acceptable 7-day trial rate
- proof links
- availability
- preferred opportunity type: paid trial, contractor, co-founder open, advisor, other

Initial proof sources:

- GitHub or code samples
- portfolio or shipped projects
- resume or LinkedIn

Later proof source:

- verified trial history from the platform

### 3. Match Recommendation

Version one matching should use:

- founder need against builder skills
- founder budget against builder minimum
- builder proof completeness
- founder seriousness score
- timezone compatibility

Output:

- top recommended builders for founder
- top relevant founder opportunities for builder
- clear reason each match is suggested

### 4. Trial Sprint Setup

Before a trial starts, the platform should capture:

- deliverable
- acceptance criteria
- out-of-scope items
- evidence required
- communication cadence
- trial stipend
- platform fee
- expected final decision options

Final decision options:

- continue as paid work
- discuss co-founder path outside the MVP
- run another trial
- stop

### 5. Work Evidence Submission

Builder submits evidence such as:

- demo URL
- pull request
- GitHub repository
- Figma link
- Loom video
- screenshots
- document
- customer interview notes
- deployment link

### 6. Proof-of-Work Record

After the trial, builder receives a record with:

- project title
- role
- skills used
- deliverables
- artifact links
- completion status
- founder feedback when available

## Suggested Technical First Cut

Keep the first build simple.

### App Screens

- landing page
- founder intake form
- builder intake form
- match list
- trial sprint brief
- evidence submission page
- proof-of-work profile

### Data Models

- user
- founder profile
- builder profile
- proof link
- match
- trial sprint
- milestone
- evidence
- proof-of-work record

### Non-Goals

- payments in the first prototype
- escrow in the first prototype
- legal agreements
- AI-driven automated approval
- complex dispute resolution
- full messaging system

Payments can be mocked in the prototype, then integrated later after validation.

## First Build Milestone

Build a clickable or functional prototype that can demonstrate:

1. founder creates a need
2. builder creates a proof-backed profile
3. system shows match reasons
4. both sides create a trial sprint brief
5. builder submits evidence
6. builder receives proof-of-work record
7. match packet can be exported for a concierge validation call

## Prototype V0.2

The current static prototype supports:

- editable founder intake
- editable builder profile creation
- local browser storage for prototype data
- match score breakdowns
- trial sprint pricing preview
- trial brief preview
- proof-of-work record preview
- JSON match packet export

This is still not a production app. It is a validation tool for showing the workflow, collecting feedback, and manually running concierge matches.
