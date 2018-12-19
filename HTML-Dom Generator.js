String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

const WRITER = {
    string:"",
    formatter:{},
    sub1:"{{",
    sub2:"}}",
    result:"",

    settings: {
      valueColoring: {
        colors: ["red", "yellow", "green"],
        elements: ["diff"]
      },
      replaceBool: ["X", "-"],
      noEmpty: true
    },

    getHtmlString: function (string, data, sub1,sub2) {
      if (Array.isArray(data)) {
        for (let i=0; i<data.length; i++) {
          this.checkForVariables(string, data[i]);
        }
      } else {
        this.checkForVariables(string, data);
      }
      return this.result;
    },

    replaceVariable:function (string, dataSet) {
        let replace = "";
        if (string.indexOf(this.sub1) < 0 || string.indexOf(this.sub2) < 0) return false;
        const SP = string.indexOf(this.sub1)+this.sub1.length;
        let string1 = string.substr(0,SP);
        let string2 = string.substr(SP);
        const TP = string1.length + string2.indexOf(this.sub2);
        const varName = string.substring(SP,TP);

        if (dataSet[varName] != undefined) {
          replace = dataSet[varName];
        } else {
          console.warn("HTML-Renderer: No data provided to replace {{"+varName+"}}");
        }
        replace = this.checkSettings(replace, varName);
        replace = this.checkForOptions(varName, dataSet, replace);

        return string.splice(string.indexOf(this.sub1), this.getCutOffLength(string, SP, TP), replace);
    },

    checkForVariables:function (string ,dataSet) {
        // first check to see if we do have both substrings
        if(string.indexOf(this.sub1) < 0 || string.indexOf(this.sub2) < 0) return;

        // find one result
        let output = this.replaceVariable(string, dataSet);

        // if there's more substrings
        if(output.indexOf(this.sub1) > -1 && output.indexOf(this.sub2) > -1) {
            this.checkForVariables(output, dataSet);
        } else {
          this.result = this.result + output;
        }
    },

    checkSettings: function(replace, varName) {
      if (this.settings) {
        let s = this.settings
        let output = "";

        if (s.replaceBool) {
          if (replace === true || replace == "true") {
            replace = s.replaceBool[0];
          } else if (replace === false || replace == "false") {
            replace = s.replaceBool[1];
          }
        }

        if (s.noEmpty) {
          if (Number.isNaN(parseFloat(replace)) && replace == "") {
            replace = s.noEmpty;
          } else if (replace == "" || replace == undefined) {
            replace = 0;
          }
        }
        
        if(s.valueColoring) {
          let color = "";
          if (!Number.isNaN(parseFloat(replace)) && s.valueColoring.elements.includes(varName)) {
            let number = parseFloat(replace);
            if (s.valueColoring.colors.length === 3) {
              if (number < 0) {
                color = s.valueColoring.colors[0];
              } else if (number == 0) {
                color = s.valueColoring.colors[1];
              } else {
                color = s.valueColoring.colors[2];
              }
            } else if (s.valueColoring.colors.length === 2) {
              if (number < 0) {
                color = s.valueColoring.colors[0];
              } else {
                color = s.valueColoring.colors[1];
              }
            } else {
              console.error("HTML-Renderer: Provide at least two and not more than three colors for the Value Coloring!");
            }
            replace = `<span style="color: ${color}">${replace}</span>`;
          }
        }
      }
      return replace;
    },

    getCutOffLength: function(string, SP, TP) {
      return string.substring(SP, TP).length + this.sub1.length + this.sub2.length;
    },

    checkForOptions: function(varName, dataSet, replace) {
      let op = this.formatter
      if (op) {
        if (op[varName]) {
          if (typeof(op[varName]) != "function") {
            return op[varName];
          } else {
            return op[varName](dataSet[varName]);
          }
        }
      }

      return replace;
    },

    renderHTML: function(obj) {
      let target = document.getElementById(obj.targetid);
      let tableHdr = obj.tableHdr;
      this.formatter = obj.formatter;

      if (obj.settings) {
        this.settings = obj.settings;
      } else {
        this.settings = {}
      }

      if (!obj.data) {
        target.innerHTML = obj.html;
      } else {
        target.innerHTML = (tableHdr != undefined ? tableHdr : "") + this.getHtmlString(obj.html, obj.data);
      }
    }
};
