let aws = require('aws-sdk')

/**
 * reads dynamo tables generated by cfn from ssm
 */
module.exports = function lookupTables(callback) {
  let ssm = new aws.SSM
  let Path = `/${process.env.ARC_CLOUDFORMATION}`
  ssm.getParametersByPath({Path, Recursive:true}, function done(err, result) {
    if (err) callback(err)
    else {
      let table = param=> param.Name.split('/')[2] === 'tables'
      let tables = result.Parameters.filter(table).reduce((a, b)=> {
        a[b.Name.split('/')[3]] = b.Value
        return a
      }, {})
      callback(null, tables)
    }
  })
}
