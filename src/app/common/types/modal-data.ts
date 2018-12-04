import { Doc } from "./doc";

export interface ModalData {
    title?: string,
    list?: Array<any>,
    index?: number,
    editedText?: string,
    status?: string,
    query?: string,
    stName?: string,
    itName?: string,
    src?: string,
    wcTypes?: Array<any>,
    jTypes?: Array<any>,
    operands?: Array<any>,
    jcOperands?: Array<any>,
    icTypes?: Array<any>,
    icOperators?: Array<any>,
    valTypes?: Array<any>,
    impName?: string,
    impVersion?: string,
    isMultiCompare?: boolean,
    srcDoc?: Doc,
    tgtDoc?: Doc
}
