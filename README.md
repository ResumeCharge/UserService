# [ResumeCharge.com](https://resumecharge.com)

<!-- ABOUT ResumeCharge -->

## About The Project

ResumeCharge is a free and open-source website builder that allows you to easily create beautiful resume
websites that are deployed directly to your GitHub account. ResumeCharge is an alternative to the large, established
website
builder companies that sell your data or lock you into contracts.

### Why ResumeCharge?

ResumeCharge allows users to have total ownership over their resume websites. Unlike the established website builder
companies,
ResumeCharge doesn't lock you into contracts or make you agree to complicated terms of service. You own the
source code and your data, forever. You can take your website with your wherever you go by downloading the source code
and importing it to another platform of your choosing.

### Who Created ResumeCharge and Why?

ResumeCharge was created by me, Adam [adamlawson.dev](https://adamlawson.dev/)!

I'm a software developer based in Vancouver, Canada. I wanted to
create an alternative to the big established website builder companies. In the website builder space it often feels like
we have two options. Option 1 is using one of the large established website builders that requires you to sign
restrictive terms of service, and locks you into a single platform. These companies may also collect and sell your data
to 3rd parties for financial gain. Option 2 is using open-source tools like Jekyll or Hyde, along with a platform such
as GitHub pages.
This forces people without the technical knowledge, or time to fiddle with these tools, to use the big website builders
in Option 1.

## ResumeCharge's goal is to combine the ease of use of the big website builders with the benefits of open-source software.

### Built With

* Java
* Thymeleaf
* Spring
* MongoDb
* AWS
* And more!

<!-- GETTING STARTED -->

## Getting Started

The instructions below are not detailed/complete at the moment, I am working to write a detailed guide for setting up
this project if you want to spin up your own instance. If you are interested in developing or running ResumeCharge
locally please reach-out to me at [adam@adamlawson.dev](mailto:adam@adamlawson.dev).

### Prerequisites

* NodeJs/NPM
* [GeneratorService](https://github.com/ResumeCharge/GeneratorService) deployed and running
* [DeploymentService](https://github.com/ResumeCharge/DeploymentService) deployed and running

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/ResumeCharge/UserService.git
   ```
2. Install dependencies
   ```sh
   npm install
   ```
3. Configure required parameters in `.development.env`
4. Setup firebase key in `firebase-private-key.json`
5. Run the deployment service
   ```sh
   npm run start
   ```
