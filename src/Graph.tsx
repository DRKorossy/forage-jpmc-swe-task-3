import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective'; // TableData wasn't imported
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',
      timestamp: 'date',
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float',
    }; // previously we plotted the two stocks to compare them, see how much the
       // top_ask_price is over time for each. But the trader would like to see what the ratio
       // is between the two. So in this step, we added all the attributes that we'll need
       // to the object called 'schema' - and we will use this later for plotting.

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line'); // we want a y-plot
      //removed the column pivots, because we no longer need to plot two graphs
      elem.setAttribute('row-pivots', '["timestamp"]'); // this is our x-axis
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
      //these are the things we will plot, and we don't need any more data. this will
      //make the plot clear and easy to interpret, and removes unnecessary data, or noise.

      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
        })
      ); // these are the attributes of the plot
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ]as unknown as TableData);
    }
  }
} // this makes sure that our graph updates correctly
                                  // when it gets new data

export default Graph;

// We created a graph that plots the ratio between two stocks
// and it shows when a trading opportunity arises!