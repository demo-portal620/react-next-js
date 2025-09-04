// import ErrorView from "@/app/error/page";
// import { useToast } from "@/hooks/use-toast";
// import { Message } from "@/infrastructure/Message";
// import { $t, isEmpty } from "@/infrastructure/commonUtil";
// import { getMessageVariant } from "@/types/apps/Message";
// import React, { createContext, useContext, useRef, useState } from "react";

// export type NotificationVariant = "success" | "error" | "warning" | "info" | "processing";

// interface ConfirmDialogProps {
//   show?: boolean;
//   title?: string;
//   content: string;
//   okBtnName?: string;
//   ngBtnName?: string;
//   okFunc: () => void;
//   ngFunc?: () => void;
// }

// const ConfirmDialogProps_DefaultValue: ConfirmDialogProps = {
//   show: false,
//   title: "",
//   content: "",
//   okFunc: () => null,
// };

// export interface HeyContextType {
//   maskFlag: boolean;
//   showMask: () => void;
//   hideMask: () => void;
//   confirmParams: ConfirmDialogProps;
//   showConfirmDialog: (params: ConfirmDialogProps) => void;
//   hideConfirmDialog: () => void;
//   alertMessage: (
//     messages: Message[],
//     title?: string,
//     variant?: NotificationVariant,
//     duration?: number
//   ) => void;
//   printErrorMsg: (
//     url: string,
//     errorMsg: string,
//   ) => void;
// }

// const HeyContext = createContext<HeyContextType | undefined>(undefined);

// export const HeyProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [maskFlag, setMaskFlag] = useState<boolean>(false);
//   const [show, setShow] = useState<boolean>(false);
//   const [errorMsg, setErrorMsg] = useState<string>("");
//   const [confirmParams, setConfirmParams] = useState<ConfirmDialogProps>(
//     ConfirmDialogProps_DefaultValue
//   );
//   const { toast } = useToast();
//   const lastMessageRef = useRef<{ message: string; timestamp: number } | null>(
//     null
//   );

//   const errorQueueRef = useRef<string[]>([]);
//   const COOLDOWN_PERIOD = 1000;

//   const showMask = () => setMaskFlag(true);
//   const hideMask = () => setMaskFlag(false);

//   const showConfirmDialog = (params: ConfirmDialogProps) => {
//     setConfirmParams({ ...params, show: true });
//   };

//   const hideConfirmDialog = () => {
//     setConfirmParams(ConfirmDialogProps_DefaultValue);
//   };
//   const handleClose = () => {
//     setShow(false);
//     errorQueueRef.current = [];
//   }
//   const printErrorMsg = (
//     url: string,
//     errorMsg: string,
//   ) => {
//     setShow(true);
//     const msg = "URL: ".concat(url.concat("\r\n")).concat("Stack: ").concat(errorMsg);
//     if(!errorQueueRef.current.includes(msg)) {
//       errorQueueRef.current.push(msg);
//     }
//     setErrorMsg(errorQueueRef.current.join("\r\n"));
//   }

//   const alertMessage = (
//     messages: Message[],
//     title?: string,
//     variant?: NotificationVariant,
//     duration: number = 5000
//   ) => {
//     messages.forEach((msg) => {
//       const now = Date.now();
//       const currentMessage = msg.code;

//       if (
//         lastMessageRef.current &&
//         lastMessageRef.current.message === currentMessage &&
//         now - lastMessageRef.current.timestamp < COOLDOWN_PERIOD
//       ) {
//         return;
//       }

//       lastMessageRef.current = {
//         message: currentMessage,
//         timestamp: now,
//       };
//       if(isEmpty(variant)) {
//         variant = getMessageVariant(messages[0]);
//         title = variant;
//       }

//       toast({
//         title: title || "Notification",
//         description: (
//           <div className="whitespace-pre-wrap">
//             {$t(msg.code, msg.args)}
//           </div>
//         ),
//         variant: variant === "error" ? "destructive" : "default",
//         duration: duration,
//         className: "bottom-right",
//       });
//     });
//   };

//   const value: HeyContextType = {
//     maskFlag,
//     showMask,
//     hideMask,
//     confirmParams,
//     showConfirmDialog,
//     hideConfirmDialog,
//     alertMessage,
//     printErrorMsg,
//   };

//   return <HeyContext.Provider value={value}>
//         {children}
//         <ErrorView show={show} handleClose={handleClose} errorMsg={errorMsg}/>
//   </HeyContext.Provider>;
// };

// export const useHeyContext = () => {
//   const context = useContext(HeyContext);
//   if (!context) {
//     throw new Error("useHeyContext must be used within a HeyProvider");
//   }
//   return context;
// };
