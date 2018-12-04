export class ComparisonRecord {
     private _dTable: string;
     private _srcQueryIndex: number;
     private _tgtQueryIndex: number;
     private _srcQuery: string;
     private _tgtQuery: string;
     private _persistedSrcQuery: string;
     private _persistedTgtQuery: string;
     private _persistedSrcText: string;
     private _persistedTgtText: string;
     private _isTgtAvailable: boolean;
     private _isSrcInitiated: boolean;
     private _isTgtInitiated: boolean;
     private _srcEditedText: string;
     private _tgtEditedText: string;

     constructor() { }

     /**
      * Getter dTable
      * @return {string}
      */
     public get dTable(): string {
          return this._dTable;
     }

     /**
      * Setter dTable
      * @param {string} value
      */
     public set dTable(value: string) {
          this._dTable = value;
     }


    /**
     * Getter srcQueryIndex
     * @return {number}
     */
	public get srcQueryIndex(): number {
		return this._srcQueryIndex;
	}

    /**
     * Setter srcQueryIndex
     * @param {number} value
     */
	public set srcQueryIndex(value: number) {
		this._srcQueryIndex = value;
	}

    /**
     * Getter tgtQueryIndex
     * @return {number}
     */
	public get tgtQueryIndex(): number {
		return this._tgtQueryIndex;
	}

    /**
     * Setter tgtQueryIndex
     * @param {number} value
     */
	public set tgtQueryIndex(value: number) {
		this._tgtQueryIndex = value;
	}



     /**
      * Getter srcQuery
      * @return {string}
      */
     public get srcQuery(): string {
          return this._srcQuery;
     }

     /**
      * Setter srcQuery
      * @param {string} value
      */
     public set srcQuery(value: string) {
          this._srcQuery = value;
     }


     /**
      * Getter tgtQuery
      * @return {string}
      */
     public get tgtQuery(): string {
          return this._tgtQuery;
     }

     /**
      * Setter tgtQuery
      * @param {string} value
      */
     public set tgtQuery(value: string) {
          this._tgtQuery = value;
     }


     /**
      * Getter persistedSrcQuery
      * @return {string}
      */
     public get persistedSrcQuery(): string {
          return this._persistedSrcQuery;
     }

     /**
      * Setter persistedSrcQuery
      * @param {string} value
      */
     public set persistedSrcQuery(value: string) {
          this._persistedSrcQuery = value;
     }

     /**
      * Getter persistedTgtQuery
      * @return {string}
      */
     public get persistedTgtQuery(): string {
          return this._persistedTgtQuery;
     }

     /**
      * Setter persistedTgtQuery
      * @param {string} value
      */
     public set persistedTgtQuery(value: string) {
          this._persistedTgtQuery = value;
     }

     /**
      * Getter persistedSrcText
      * @return {string}
      */
     public get persistedSrcText(): string {
          return this._persistedSrcText;
     }

     /**
      * Setter persistedSrcText
      * @param {string} value
      */
     public set persistedSrcText(value: string) {
          this._persistedSrcText = value;
     }

     /**
      * Getter persistedTgtText
      * @return {string}
      */
     public get persistedTgtText(): string {
          return this._persistedTgtText;
     }

     /**
      * Setter persistedTgtText
      * @param {string} value
      */
     public set persistedTgtText(value: string) {
          this._persistedTgtText = value;
     }


     /**
      * Getter isTgtAvailable
      * @return {boolean}
      */
     public get isTgtAvailable(): boolean {
          return this._isTgtAvailable;
     }

     /**
      * Setter isTgtAvailable
      * @param {boolean} value
      */
     public set isTgtAvailable(value: boolean) {
          this._isTgtAvailable = value;
     }


     /**
      * Getter isSrcInitiated
      * @return {boolean}
      */
     public get isSrcInitiated(): boolean {
          return this._isSrcInitiated;
     }

     /**
      * Setter isSrcInitiated
      * @param {boolean} value
      */
     public set isSrcInitiated(value: boolean) {
          this._isSrcInitiated = value;
     }

     /**
      * Getter isTgtInitiated
      * @return {boolean}
      */
     public get isTgtInitiated(): boolean {
          return this._isTgtInitiated;
     }

     /**
      * Setter isTgtInitiated
      * @param {boolean} value
      */
     public set isTgtInitiated(value: boolean) {
          this._isTgtInitiated = value;
     }

     /**
      * Getter srcEditedText
      * @return {string}
      */
     public get srcEditedText(): string {
          return this._srcEditedText;
     }

     /**
      * Setter srcEditedText
      * @param {string} value
      */
     public set srcEditedText(value: string) {
          this._srcEditedText = value;
     }

     /**
      * Getter tgtEditedText
      * @return {string}
      */
     public get tgtEditedText(): string {
          return this._tgtEditedText;
     }

     /**
      * Setter tgtEditedText
      * @param {string} value
      */
     public set tgtEditedText(value: string) {
          this._tgtEditedText = value;
     }


}
