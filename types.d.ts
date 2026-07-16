declare global {
  type Alarisa_Comm_Back_Handler_PrincipalContribution = typeof import("./src/Back/Handler/PrincipalContribution.mjs").default;
  type Alarisa_Comm_Back_Handler_PrincipalContribution$ = InstanceType<Alarisa_Comm_Back_Handler_PrincipalContribution>;
  type Alarisa_Comm_Back_Handler_Authentication = typeof import("./src/Back/Handler/Authentication.mjs").default;
  type Alarisa_Comm_Back_Handler_Authentication$ = InstanceType<Alarisa_Comm_Back_Handler_Authentication>;
  type Alarisa_Comm_Contract_Authentication = typeof import("./src/Contract/Authentication.mjs").default;
  type Alarisa_Comm_Contract_Authentication$ = InstanceType<Alarisa_Comm_Contract_Authentication>;
  type Alarisa_Comm_Contract_PrincipalContribution = typeof import("./src/Contract/PrincipalContribution.mjs").default;
  type Alarisa_Comm_Contract_PrincipalContribution$ = InstanceType<Alarisa_Comm_Contract_PrincipalContribution>;
  type Alarisa_Comm_Node_IncomingMessage = import("node:http").IncomingMessage;
  type Alarisa_Comm_Node_ServerResponse = import("node:http").ServerResponse;
}

export {};
