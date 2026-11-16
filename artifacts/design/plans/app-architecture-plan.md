# Application Design Plan

Scope: Subscription Management Platform (backend FastAPI unit + frontend React unit), per `specs.md` and `stories.md`.

## Steps
- [x] Generate components.md
- [x] Generate component-methods.md
- [x] Generate services.md
- [x] Generate component-dependency.md
- [x] Generate app-architecture.md (consolidated)
- [x] Validate design completeness and consistency

## Questions

## Question 1
How should the backend be layered?

A) Router -> Service -> Repository (SQLAlchemy) per module (Recommended)

B) Router -> Service, with services using SQLAlchemy sessions directly

C) Other (please describe after [Answer]: tag below)

[Answer]: A) Router -> Service -> Repository (SQLAlchemy) per module (Recommended)

## Question 2
Where should the renewal scheduler call its logic?

A) The scheduler job calls the same SubscriptionService.renew method used by the manual "renew now" endpoint (Recommended)

B) A separate dedicated renewal service duplicating the logic

C) Other (please describe after [Answer]: tag below)

[Answer]: A) The scheduler job calls the same SubscriptionService.renew method used by the manual "renew now" endpoint (Recommended)

## Question 3
How should the frontend manage server state and routing?

A) React Router + TanStack Query + an Axios API client with auth interceptor (Recommended)

B) React Router + plain fetch with React Context state

C) Other (please describe after [Answer]: tag below)

[Answer]: A) React Router + TanStack Query + an Axios API client with auth interceptor (Recommended)

## Question 4
How should the simulated gateway be structured?

A) A PaymentGateway interface with a SimulatedGateway implementation, injected into billing (Recommended)

B) A single function in the billing module

C) Other (please describe after [Answer]: tag below)

[Answer]: A) A PaymentGateway interface with a SimulatedGateway implementation, injected into billing (Recommended)
