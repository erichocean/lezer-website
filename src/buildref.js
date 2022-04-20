const {gatherMany} = require("getdocs-ts")
const {build} = require("builddocs")
const {join, relative} = require("path")
const {realpathSync} = require("fs")

function Mod(name) {
  this.name = name
  let dir = require.resolve("@lezer/" + name)
  this.base = dir.replace(/[\\\/]dist[\\\/][^\\\/]*$/, "")
  this.main = join(join(this.base, "src"), name == "highlight" ? "highlight.ts" : "index.ts")
  this.path = realpathSync(relative(process.cwd(), this.base) + "/")
}

exports.buildRef = function buildRef() {
  let modules = ["common", "lr", "highlight", "generator"].map(n => new Mod(n))

  let moduleItems = gatherMany(modules.map(mod => ({filename: mod.main, basedir: mod.base})))
  return modules.map((mod, i) => {
    return {
      name: mod.name,
      content: build({
        name: mod.name,
        anchorPrefix: mod.name + ".",
        main: join(mod.main, "../README.md"),
        allowUnresolvedTypes: false,
        breakAt: 45,
        imports: [type => {
          let sibling = type.typeSource && modules.find(m => realpathSync(type.typeSource).startsWith(m.path))
          if (sibling) return "#" + sibling.name + "." + type.type
        }]
      }, moduleItems[i])
    }
  })
}
