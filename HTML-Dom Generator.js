String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

const WRITER = {
    string:"",
    sub1:"",
    sub2:"",
    result:"",
    getHtmlString: function (string, data, sub1,sub2) {
      this.string = string;
      this.sub1 = (sub1 != undefined) ? sub1 : "{{";
      this.sub2 = (sub2 != undefined) ? sub2 : "}}";

      if (Array.isArray(data)) {
        for (let i=0; i<data.length; i++) {
          this.checkForVariables(data[i]);
          this.result = this.result + this.string;
        }
      } else {
        this.checkForVariables(data);
        this.result = this.string;
      }
      return this.result;
    },
    replaceVariable:function (dataSet) {
        if(this.string.indexOf(this.sub1) < 0 || this.string.indexOf(this.sub2) < 0) return false;
        const SP = this.string.indexOf(this.sub1)+this.sub1.length;
        let string1 = this.string.substr(0,SP);
        let string2 = this.string.substr(SP);
        const TP = string1.length + string2.indexOf(this.sub2);
        const varName = this.string.substring(SP,TP);
        this.string = this.string.splice(this.string.indexOf(this.sub1), this.getCutOffLength(SP, TP), dataSet[varName] || "");
    },
    checkForVariables:function (dataSet) {
        // first check to see if we do have both substrings
        if(this.string.indexOf(this.sub1) < 0 || this.string.indexOf(this.sub2) < 0) return;

        // find one result
        this.replaceVariable(dataSet);

        // if there's more substrings
        if(this.string.indexOf(this.sub1) > -1 && this.string.indexOf(this.sub2) > -1) {
            this.checkForVariables(dataSet);
        } else {
          return;
        }
    },
    getCutOffLength: function(SP, TP) {
      return this.string.substring(SP, TP).length + this.sub1.length + this.sub2.length;
    },
    renderHTML: function(obj) {
      let target = obj.target;
      let html = obj.html;
      let data = obj.data;
      let tableHdr = obj.tableHdr;

      if (!data) {
        target.html(html);
      } else {
        target.html((tableHdr != undefined ? tableHdr : "") + this.getHtmlString(obj.html, data));
      }
    }
};
