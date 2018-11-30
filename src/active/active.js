/* global angular */
import { select, event } from 'd3-selection'
import { drag } from 'd3-drag'
import 'd3-transition'

angular.module('palladioDataPenComponent.active', [])
  .directive('dpActive', ['palladioService', 'dataService', function (palladioService, dataService) {
    return {
      scope: {},
      template: require('./active.pug'),
      controller: ['$scope', '$document', '$timeout', function ActiveController ($scope, $document, $timeout) {
        let $ctrl = this
        $scope.$ctrl = $ctrl
        $ctrl.radiusInitial = 1
        $ctrl.radius = 8
        $ctrl.radiusBounce = 4
        $ctrl.items = []
        $ctrl.selectedNodes = []
        let dragSelection = []

        $ctrl.getCanvasSize = function () {
          let s = select('.main-svg')
          return {
            height: s.node().clientHeight,
            width: s.node().clientWidth
          }
        }

        $ctrl.updateCanvasSize = function () {
          let canvasSize = $ctrl.getCanvasSize()
          let h = canvasSize.height
          let w = canvasSize.width

          let r = select('.main-background')
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
          event.preventDefault()
          $scope.$apply(() => {
            // $ctrl.menu.hide()
            // $ctrl.multiMenu.hide()
            // if ($ctrl.linkEndFunction) $ctrl.linkEndFunction()
            // $ctrl.updateMenuTooltip()

            if (!$ctrl.currentlyAdding) {
              $ctrl.nodeSearchSelected = ''
              $ctrl.nodeSearchOffsetTop = event.offsetY
              $ctrl.nodeSearchOffsetLeft = event.offsetX
              $ctrl.appendNode(sel, $ctrl.nodeSearchOffsetTop, $ctrl.nodeSearchOffsetLeft, 'addition-node')
              $ctrl.nodeSearch
                .style('top', $ctrl.nodeSearchOffsetTop - 17 + 'px')
              $ctrl.nodeSearch.style('left', $ctrl.nodeSearchOffsetLeft + 30 + 'px')

              $ctrl.nodeSearchTypeahead = select('.custom-popup-wrapper')
              if (window.innerHeight - event.offsetY < $ctrl.nodeSearchTypeaheadHeight) {
                $ctrl.nodeSearchTypeahead.style('max-height', (window.innerHeight - event.offsetY - 100) + 'px')
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
          let s = select('.main-svg')
          let g = s.select('.main-g')

          g.select('rect')
            .on('contextmenu', $ctrl.canvasClick.bind($ctrl, g))
            .on('click', () => {
              if ($ctrl.linkEndFunction) $ctrl.linkEndFunction()
            })
            .call(drag()
              .on('start', () => {
                $scope.$apply(() => {
                  // this.menu.hide()
                  // this.multiMenu.hide()
                  // this.updateMenuTooltip()
                  this.nodeSearchRemove()
                  if (!event.sourceEvent.shiftKey) {
                    this.selectedNodes = []
                  }
                  this.updateCanvas()
                })
                select('.main-g')
                  .append('rect')
                  .classed('selection-rect', true)
              })
              .on('drag', () => {
                if (event.x - event.subject.x < 0) {
                  select('.selection-rect')
                    .attr('x', event.x)
                    .attr('width', event.subject.x - event.x)
                } else {
                  select('.selection-rect')
                    .attr('x', event.subject.x)
                    .attr('width', event.x - event.subject.x)
                }
                if (event.y - event.subject.y < 0) {
                  select('.selection-rect')
                    .attr('y', event.y)
                    .attr('height', event.subject.y - event.y)
                } else {
                  select('.selection-rect')
                    .attr('y', event.subject.y)
                    .attr('height', event.y - event.subject.y)
                }
                $ctrl.items.forEach((i) => {
                  if (i.leftOffset > parseInt(select('.selection-rect').attr('x'), 10) &&
                    i.leftOffset < parseInt(select('.selection-rect').attr('x'), 10) + parseInt(select('.selection-rect').attr('width'), 10) &&
                    i.topOffset > parseInt(select('.selection-rect').attr('y'), 10) &&
                    i.topOffset < parseInt(select('.selection-rect').attr('y'), 10) + parseInt(select('.selection-rect').attr('height'), 10) &&
                    $ctrl.selectedNodes.concat(dragSelection).indexOf(i) === -1) {
                    dragSelection.push(i)
                  } else if (
                    !(i.leftOffset > parseInt(select('.selection-rect').attr('x'), 10) &&
                      i.leftOffset < parseInt(select('.selection-rect').attr('x'), 10) + parseInt(select('.selection-rect').attr('width'), 10) &&
                      i.topOffset > parseInt(select('.selection-rect').attr('y'), 10) &&
                      i.topOffset < parseInt(select('.selection-rect').attr('y'), 10) + parseInt(select('.selection-rect').attr('height'), 10)) &&
                    dragSelection.indexOf(i) !== -1
                  ) {
                    // Outside the current selection box but in the current drag selection, remove it.
                    dragSelection.splice(dragSelection.indexOf(i), 1)
                  }
                })
                $scope.$digest()
                this.updateCanvas()
              })
              .on('end', () => {
                select('.selection-rect').remove()
                dragSelection.forEach(i => $ctrl.selectedNodes.push(i))
                dragSelection = []
                $scope.$digest()
                $timeout(0).then(() => this.updateCanvas())
              })
            )

          $ctrl.updateCanvasSize()
        }

        let calculateMatchQuality = function (label, searchValue) {
          let lowerValue = searchValue.toLowerCase()
          let lowerLabel = label.toLowerCase()
          if (lowerValue === lowerLabel) return 100
          if (lowerLabel.indexOf(lowerValue) !== -1) return 10
          return 1
        }

        $ctrl.nodeSearchResults = function (searchValue) {
          let results = []
          dataService.getFiles().forEach(file => {
            let descriptionField = file.fields.filter(field => field.countDescription)[0]
            let matches = file.data.filter(row => {
              return Object.values(row).filter(value => {
                return value.toLowerCase().includes(searchValue.toLowerCase())
              }).length > 0
            })
            matches.filter((match) => {
              // Don't display matches that are already showing as nodes
              return $ctrl.items.map(i => i.record).indexOf(match) === -1
            }).forEach(match => {
              results.push({
                type: file.label,
                value: match[descriptionField.key],
                data: match,
                quality: calculateMatchQuality(match[descriptionField.key], searchValue)
              })
            })
          })
          results.sort((a, b) => {
            if (a.quality < b.quality) return 1
            if (a.quality > b.quality) return -1
            return 0
          })
          return results
        }

        $ctrl.nodeSearchSelect = function ($item, $model, $label, $event) {
          console.log($item, $model)
          let item = {
            id: $item.value,
            value: $item.value,
            type: $item.type,
            record: $item.data,
            description: $item.value,
            topOffset: this.nodeSearchOffsetTop,
            leftOffset: this.nodeSearchOffsetLeft
          }

          $ctrl.items.push(item)
          $ctrl.nodeSearchRemove()
          $ctrl.updateCanvas()
        }

        $ctrl.nodeSearchRemove = function () {
          select('.addition-node').remove()
          $ctrl.currentlyAdding = false
        }

        $ctrl.updateCanvas = function () {
          let s = select('.main-svg')
          let g = s.select('.main-g')
          let itemG = g.select('.main-g-items')
          // let linkG = g.select('.main-g-links')

          // let linkSelection = linkG.selectAll('.item-link')
          //   .data(this.calculateLinks(), (link) => {
          //     return link.source.ids[0].value + link.target.ids[0].value + link.prop.value
          //   })

          // linkSelection.exit().remove()

          // let linkEnterSel = linkSelection.enter()
          //   .append('g')
          //   .attr('id', (link) => 'link-' + this.sanitizeId(link.source.ids[0].value + link.target.ids[0].value + link.prop.value))
          //   .classed('link', true)
          //   .classed('item-link', true)

          // linkEnterSel.append('line')
          //   .classed('link-line', true)
          //   .on('mouseenter', (link, i, grp) => {
          //     d3.select('#' + this.sanitizeId(link.source.ids[0].value + link.target.ids[0].value + link.prop.value))
          //       .style('top', (grp[i].getBoundingClientRect().top + grp[i].getBoundingClientRect().height / 2 - 10 ) + 'px')
          //       .style('left', (grp[i].getBoundingClientRect().left + grp[i].getBoundingClientRect().width / 2) + 'px')
          //       .style('opacity', '1')
          //       .text(link.prop.labels.values()[0] ? link.prop.labels.values()[0].value : 'Loading...')
          //   })
          //   .on('mouseout', (link, i) => {
          //     if (!this.viewOptionsShowLinkLabels) {
          //       d3.select('#' + this.sanitizeId(link.source.ids[0].value + link.target.ids[0].value + link.prop.value)).style('opacity', '0')
          //     }
          //   })

          // linkSelection = linkSelection.merge(linkEnterSel)

          // linkSelection
          //   .attr('transform', (d) => { return 'translate(' + d.source.leftOffset + ',' + d.source.topOffset + ')' })
          //   .style('opacity', this.viewOptionsShowLinks ? '1' : '0')

          // linkSelection
          //   .select('line')
          //     .attr('x1', d => 0 + 'px' )
          //     .attr('y1', d => 0 + 'px' )
          //     .attr('x2', d => ( d.target.leftOffset - d.source.leftOffset ) + 'px' )
          //     .attr('y2', d => ( d.target.topOffset - d.source.topOffset ) + 'px' )

          // let linkTooltipSelection = d3.select('.link-tooltips')
          //   .selectAll('.active-tooltip')
          //   .data(this.calculateLinks(), (link) => {
          //     return link.source.ids[0].value + link.target.ids[0].value + link.prop.value
          //   })

          // linkTooltipSelection.exit().remove()
          // linkTooltipSelection.enter()
          //   .append('div')
          //     .classed('active-tooltip', true)
          //     .attr('id', (link) => this.sanitizeId(link.source.ids[0].value + link.target.ids[0].value + link.prop.value))

          let itemSelection = itemG.selectAll('.item-node')
            .data($ctrl.items, (it) => {
              return it.value
            })

          itemSelection.exit().remove()

          let tooltipSelection = select('.tooltips')
            .selectAll('.active-tooltip')
            .data($ctrl.items, (it) => {
              return it.value
            })

          tooltipSelection.exit().remove()
          tooltipSelection.enter()
            .append('div')
            .classed('active-tooltip', true)
            .attr('id', (it) => sanitizeId(it.value))

          let enterSel = itemSelection.enter()
            .append('g')
            .classed('node', true)
            .classed('item-node', true)
            .attr('transform', (d) => { return 'translate(' + d.leftOffset + ',' + d.topOffset + ')' })

          enterSel.append('circle')
            .classed('search-backing', true)

          enterSel.append('circle')
            .classed('node-circle', true)
            // .on('contextmenu', (d, i, groups) => {
            //   d3.event.preventDefault()
            //   this.nodeClick(d, groups)
            // })
            // .on('click', (d, i, groups) => {
            //   if (this.linkMode) {
            //     this.linkEndFunction(d)
            //     this.linkMode = false
            //   } else {
            //     this.lastClickTargetSelected = this.selectedNodes.indexOf(d) !== -1
            //     if (d3.event.shiftKey) {
            //       if (this.selectedNodes.indexOf(d) === -1) {
            //         this.selectedNodes.push(d)
            //       } else {
            //         this.selectedNodes.splice(this.selectedNodes.indexOf(d), 1)
            //       }
            //       console.log('Node clicked while holding shift. Currently: ' + this.selectedNodes.length + ' nodes selected.')
            //     } else {
            //       if (this.selectedNodes.indexOf(d) === -1) {
            //         this.selectedNodes = []
            //         this.selectedNodes.push(d)
            //       }
            //     }
            //     this.$scope.$digest()
            //     this.updateCanvas()
            //   }
            // })
            // .on('dblclick', (d, i, groups) => {
            //   // Keep in mind that click also triggers twice when this event triggers.
            //   if (d.item) {
            //     if (this.lastClickTargetSelected) {
            //       this.selectedNodes.slice().forEach((n) => {
            //         this.getLinkedNodes(n)
            //           .filter(no => this.selectedNodes.indexOf(no) === -1)
            //           .forEach(no => this.selectedNodes.push(no))
            //       })
            //     } else {
            //       this.getLinkedNodes(d)
            //         .filter(n => this.selectedNodes.indexOf(n) === -1)
            //         .forEach(n => this.selectedNodes.push(n))
            //       if (this.selectedNodes.indexOf(d) === -1) this.selectedNodes.push(d)
            //     }
            //     this.updateCanvas()
            //   }
            // })
            .on('mouseenter', (d, i, grp) => {
              if (d.value && !this.dragOrigX) {
                select('#' + sanitizeId(d.value))
                  .style('top', (d2, i2, grp2) => (d2.topOffset - 13) + 'px')
                  .style('left', (d2, i2, grp2) => (d2.leftOffset + 30) + 'px')
                  .style('opacity', '1')
                  .text(d.description)
              } else if (!this.dragOrigX) {
                select('#' + sanitizeId(d.value))
                  .style('top', (d2, i2, grp2) => (d2.topOffset - 13) + 'px')
                  .style('left', (d2, i2, grp2) => (d2.leftOffset + 30) + 'px')
                  .style('opacity', '1')
                  .text('Loading...')
              }
            })
            .on('mouseout', (d, i) => {
              if (!this.viewOptionsShowLabels) {
                select('#' + sanitizeId(d.value)).style('opacity', '0')
              }
            })
            .call(drag()
              .on('start', (d, i) => {
                ((this.selectedNodes.indexOf(d) === -1) ? [d] : this.selectedNodes).forEach((is) => {
                  select('#' + sanitizeId(d.value)).style('opacity', '0')
                })
                this.dragOrigX = d.leftOffset
                this.dragOrigY = d.topOffset
              })
              .on('drag', (d, i, group) => {
                let origTop = d.topOffset
                let origLeft = d.leftOffset
                let selectedNodes = (this.selectedNodes.indexOf(d) === -1) ? [d] : this.selectedNodes
                selectedNodes.forEach((is) => {
                  is.leftOffset = event.x + this.dragOrigX + (is.leftOffset - origLeft)
                  is.topOffset = event.y + this.dragOrigY + (is.topOffset - origTop)
                  if (is.topOffset < 20) { is.topOffset = 20 }
                  if (is.topOffset > window.innerHeight - 75) { is.topOffset = window.innerHeight - 75 }
                  if (is.leftOffset < 20) { is.leftOffset = 20 }
                  if (is.leftOffset > window.innerWidth - 20) { is.leftOffset = window.innerWidth - 20 }
                })
                this.dragOrigX = d.leftOffset
                this.dragOrigY = d.topOffset
                this.updateCanvas()
              })
              .on('end', (d, i, group) => {
                this.dragOrigX = null
                this.dragOrigY = null
                this.updateCanvas()
              }))

          itemSelection = itemSelection.merge(enterSel)

          itemSelection.each((datum, i) => {
            $ctrl.maintainNode(select(itemSelection.nodes()[i]), datum.leftOffset, datum.topOffset)
          })

          if (this.viewOptionsShowLabels) this.showTooltips()
          if (this.viewOptionsShowLinkLabels) this.showLinkTooltips()
        }

        $ctrl.maintainNode = function (sel, top, left) {
          sel.attr('transform', 'translate(' + top + ',' + left + ')')
          // sel.select('.search-backing')
          //   .classed('search-result', (d) => this.state.project.search !== '' && getPrefLangString(d.item.labels, this.state.general.language).toLowerCase().indexOf(this.state.project.search.toLowerCase()) !== -1)
          //   .transition().attr('r', (d) => {
          //     if (this.showLayerEffect && d.item && d.item.localProperties.concat(d.item.remoteProperties).find(p => p.property.value === RDF.type.value)) {
          //       let layerIndex: number = d.item.localProperties
          //         .concat(d.item.remoteProperties)
          //         .find(p => p.property.value === RDF.type.value).values
          //         .reduce(
          //           (a, b) => {
          //             let foundIndex: number = this.currentClasses.findIndex(c => c.value === b.value.value)
          //             return foundIndex !== -1 && foundIndex < a ? foundIndex : a
          //           },
          //           this.currentClasses.length - 1
          //         )
          //       return (this.radii[layerIndex] + this.searchHighlightRadiusAddition) + 'px'
          //     } else {
          //       return (this.radius + this.searchHighlightRadiusAddition) + 'px'
          //     }
          //   })
          sel.select('.node-circle')
            // .classed('loading', (d) => {
            //   return d.item === null
            // })
            // .classed('red', (d) => d.mark === Mark.Red)
            // .classed('yellow', (d) => {
            //   return d.mark === Mark.Yellow
            // })
            // .classed('green', (d) => d.mark === Mark.Green)
            // .classed('blue', (d) => d.mark === Mark.Blue)
            // .classed('white', (d) => d.mark === Mark.White)
            .attr('filter', d => $ctrl.selectedNodes.concat(this.dragSelection).indexOf(d) !== -1 ? 'url(#drop-shadow)' : '')
            .transition().attr('r', (d) => {
              // if (this.showLayerEffect && d.item && d.item.localProperties.concat(d.item.remoteProperties).find(p => p.property.value === RDF.type.value)) {
              //   let layerIndex = d.item.localProperties
              //     .concat(d.item.remoteProperties)
              //     .find(p => p.property.value === RDF.type.value).values
              //     .reduce(
              //       (a, b) => {
              //         let foundIndex = this.currentClasses.findIndex(c => c.value === b.value.value)
              //         return foundIndex !== -1 && foundIndex < a ? foundIndex : a
              //       },
              //       this.currentClasses.length - 1
              //     )
              //   return this.radii[layerIndex] + 'px'
              // } else {
              return this.radius + 'px'
              // }
            })
          return sel
        }

        $ctrl.nodeSearchLabel = function (searchResult) {
          return searchResult.value
        }

        let sanitizeId = function (id) {
          return 'f' + id.replace(/\/|:|\.|\(|\)|%|#|\+|_|\s/g, '')
        }

        $ctrl.$postLink = function () {
          $timeout(1000).then(function () {
            $ctrl.buildCanvas()
            $ctrl.nodeSearch = select('.node-search')
          })
        }

        return $ctrl
      }]
    }
  }])
