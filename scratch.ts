import getDistance from './src/modules/map/get-distance.ts'
try {
  getDistance({latitude: 0, longitude: 0}, {latitude: 0.5, longitude: 179.5})
  console.log("converged")
} catch (e) {
  console.log("failed to converge", e)
}

try {
  getDistance({latitude: -10, longitude: 20}, {latitude: 10, longitude: -160 + 0.0001}) // antipodal is 10, -160
  console.log("converged2")
} catch(e) {
  console.log("failed to converge2", e)
}
