/* global angular */

angular.module('palladioDataPenComponent.group-modal', [])
  .directive('groupModal', ['palladioService', 'dataService', function (palladioService, dataService) {
    return {
      bindings: {
        resolve: '<',
        close: '&',
        dismiss: '&'
      },
      template: require('./group-modal.pug'),
      controller: ['$scope', '$resolve', function ($scope, $resolve) {
        let $ctrl = this
        $scope.$ctrl = $ctrl

        $ctrl.close = $scope.$close
        $ctrl.resolve = $scope.$resolve
        $ctrl.groups = () => {
          let groups = new Set()
          $ctrl.resolve.items.forEach(item => {
            let key = metadata.filter(m => m.countDescription === item.type)[0].key
            let records = data.filter(d => d[key] === item.id)
            records.forEach(r => {
              groupsForKeys[getIdx(r)].forEach(g => groups.add(g))
            })
          })
          return groups.values()
        }

        let metadata = dataService.getDataSync().metadata
        let groupDimension = metadata.filter(m => m.key === 'Group')[0]
        let data = dataService.getDataSync().data
        let xfilter = dataService.getDataSync().xfilter
        let keys = metadata.filter(m => m.countDescription).map(m => m.key)

        let groupsForKeys = {}

        let getIdx = d => JSON.stringify(keys.map(k => d[k]))

        data.forEach(d => {
          let idx = getIdx(d)
          if (!groupsForKeys[idx]) {
            groupsForKeys[idx] = new Set()
          }

          if(d['Group']) groupsForKeys[idx].add(d['Group'])
        })

        $ctrl.setGroup = function (grpDesc) {
          $ctrl.resolve.items.map(item => {
            let key = metadata.filter(m => m.countDescription === item.type)[0].key
            let records = data.filter(d => d[key] === item.id)

            // Check if group is already on unique key
            records.forEach(r => {
              if (!groupsForKeys[getIdx(r)].has(grpDesc)) {
                // Add it
                groupsForKeys[getIdx(r)].add(grpDesc)

                // Update the data
                let newRecord = angular.extend({}, r)
                newRecord['Group'] = grpDesc
                data.push(newRecord)

                // Update the Crossfilter
                xfilter.add([newRecord])
              }
            })

            // Update the metadata
            let unq = groupDimension.uniques.filter(u => u.key === grpDesc)[0]
            if (unq) {
              unq.value++
            } else {
              groupDimension.uniques.push({
                key: grpDesc,
                value: 1
              })
            }
          })

          // Trigger Palladio update
          palladioService.update()
        }
      }]
    }
  }])
