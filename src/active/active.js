/* global angular d3 */

angular.module('palladioDataPenComponent.active', [])
  .directive('dpActive', ['palladioService', function (palladioService) {
    return {
      scope: {},
      template: require('./active.pug'),
      controller: ['$scope', '$document', '$timeout', function ActiveController ($scope, $document, $timeout) {
        let $ctrl = this
        $scope.$ctrl = $ctrl
        $ctrl.radiusInitial = 1
        $ctrl.radius = 8
        $ctrl.radiusBounce = 4

        $ctrl.getCanvasSize = function () {
          let s = d3.select('.main-svg')
          return {
            height: s.node().clientHeight,
            width: s.node().clientWidth
          }
        }

        $ctrl.updateCanvasSize = function () {
          let canvasSize = $ctrl.getCanvasSize()
          let h = canvasSize.height
          let w = canvasSize.width

          let r = d3.select('.main-background')
          r.style('height', h)
          r.style('width', w)
        }

        $ctrl.appendNode = function (sel, top, left, clss) {
          let g = sel.append('g')
            .classed('node', true)
            .classed(clss, true)
            .attr('transform', 'translate(' + left + ',' + top + ')')

          let c = g.append('circle')
            .classed('node-circle', true)
            .attr('r', this.radiusInitial + 'px')

          c.transition()
            .attr('r', (this.radiusInitial + this.radiusBounce) + 'px')
            .transition()
            .attr('r', this.radius + 'px')

          return g
        }

        $ctrl.canvasClick = function (sel) {
          d3.event.preventDefault()
          $scope.$apply(() => {
            // $ctrl.menu.hide()
            // $ctrl.multiMenu.hide()
            // if ($ctrl.linkEndFunction) $ctrl.linkEndFunction()
            // $ctrl.updateMenuTooltip()

            if (!$ctrl.currentlyAdding) {
              $ctrl.nodeSearchOffsetTop = d3.event.offsetY
              $ctrl.nodeSearchOffsetLeft = d3.event.offsetX
              $ctrl.appendNode(sel, $ctrl.nodeSearchOffsetTop, $ctrl.nodeSearchOffsetLeft, 'addition-node')
              $ctrl.nodeSearch
                .style('top', d3.event.offsetY + $ctrl.nodeSearchTopOffset + 'px')
              $ctrl.nodeSearch.style('left', d3.event.offsetX + 30 + 'px')

              $ctrl.nodeSearchTypeahead = d3.select('.custom-popup-wrapper')
              if (window.innerHeight - d3.event.offsetY < $ctrl.nodeSearchTypeaheadHeight) {
                $ctrl.nodeSearchTypeahead.style('max-height', (window.innerHeight - d3.event.offsetY - 100) + 'px')
              } else {
                $ctrl.nodeSearchTypeahead.style('max-height', $ctrl.nodeSearchTypeaheadHeight + 'px')
              }

              $timeout(250).then(() => {
                $ctrl.nodeSearch.select('input').node().focus()
              })
            }

            $ctrl.currentlyAdding = true
          })
        }

        $ctrl.buildCanvas = function () {
          let s = d3.select('.main-svg')
          let g = s.select('.main-g')

          g.select('rect')
            .on('contextmenu', $ctrl.canvasClick.bind($ctrl, g))
            .on('click', () => {
              if ($ctrl.linkEndFunction) $ctrl.linkEndFunction()
            })
            // .call(d3.drag()
            //   .on('start', () => {
            //     this.$scope.$apply(() => {
            //       this.menu.hide()
            //       this.multiMenu.hide()
            //       this.updateMenuTooltip()
            //       this.nodeSearchRemove()
            //       if (!d3.event.sourceEvent.shiftKey) {
            //         this.selectedNodes = []
            //       }
            //       this.updateCanvas()
            //     })
            //     d3.select('.main-g')
            //       .append('rect')
            //       .classed('selection-rect', true)
            //   })
            //   .on('drag', () => {
            //     if (d3.event.x - d3.event.subject.x < 0) {
            //       d3.select('.selection-rect')
            //         .attr('x', d3.event.x)
            //         .attr('width', d3.event.subject.x - d3.event.x)
            //     } else {
            //       d3.select('.selection-rect')
            //         .attr('x', d3.event.subject.x)
            //         .attr('width', d3.event.x - d3.event.subject.x)
            //     }
            //     if (d3.event.y - d3.event.subject.y < 0) {
            //       d3.select('.selection-rect')
            //         .attr('y', d3.event.y)
            //         .attr('height', d3.event.subject.y - d3.event.y)
            //     } else {
            //       d3.select('.selection-rect')
            //         .attr('y', d3.event.subject.y)
            //         .attr('height', d3.event.y - d3.event.subject.y)
            //     }
            //     this.state.active.activeLayout.items.forEach((i) => {
            //       if (i.leftOffset > parseInt(d3.select('.selection-rect').attr('x'), 10) &&
            //         i.leftOffset < parseInt(d3.select('.selection-rect').attr('x'), 10) + parseInt(d3.select('.selection-rect').attr('width'), 10) &&
            //         i.topOffset > parseInt(d3.select('.selection-rect').attr('y'), 10) &&
            //         i.topOffset < parseInt(d3.select('.selection-rect').attr('y'), 10) + parseInt(d3.select('.selection-rect').attr('height'), 10) &&
            //         this.selectedNodes.concat(this.dragSelection).indexOf(i) === -1) {

          //         this.dragSelection.push(i)
          //       } else if (
          //         !(i.leftOffset > parseInt(d3.select('.selection-rect').attr('x'), 10) &&
          //           i.leftOffset < parseInt(d3.select('.selection-rect').attr('x'), 10) + parseInt(d3.select('.selection-rect').attr('width'), 10) &&
          //           i.topOffset > parseInt(d3.select('.selection-rect').attr('y'), 10) &&
          //           i.topOffset < parseInt(d3.select('.selection-rect').attr('y'), 10) + parseInt(d3.select('.selection-rect').attr('height'), 10)) &&
          //         this.dragSelection.indexOf(i) !== -1
          //       ) {
          //         // Outside the current selection box but in the current drag selection, remove it.
          //         this.dragSelection.splice(this.dragSelection.indexOf(i), 1)
          //       }
          //     })
          //     this.$scope.$digest()
          //     this.updateCanvas()
          //   })
          //   .on('end', () => {
          //     d3.select('.selection-rect').remove()
          //     this.dragSelection.forEach(i => this.selectedNodes.push(i))
          //     this.dragSelection = []
          //     this.$scope.$digest()
          //     this.$timeout(0).then(() => this.updateCanvas())
          //   })
          // )

          $ctrl.updateCanvasSize()
        }

        $ctrl.$postLink = function () {
          $timeout(1000).then(function () {
            $ctrl.buildCanvas()
            $ctrl.nodeSearch = d3.select('.node-search')
          })
        }

        return $ctrl
      }]
    }
  }])
