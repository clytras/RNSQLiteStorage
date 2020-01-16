import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Button,
  View,
  Text,
  StatusBar,
} from 'react-native';

import SQLite from 'react-native-sqlite-storage';


export default class App extends React.Component {
  state = {
    data: []
  }

  constructor(props) {
    super(props);

    this.addData = this.addData.bind(this);
    this.loadData = this.loadData.bind(this);
    this.renderData = this.renderData.bind(this);
  }

  componentDidMount() {
    SQLite.openDatabase(
      {
        name: 'test_rn_061.db', 
        location: 'Library'
      }, 
      db => {
        console.log('Connected to SQLite db');

        db.transaction(tx => {
          tx.executeSql(`CREATE VIRTUAL TABLE email USING fts5(sender, title, body);`);
        },
        error => console.warn(`create virtual fts5 error`, error),
        () => {
          console.log('create virtual fts5 success');
        });

        this.loadData(db);
        this.setState({ db });
      },
      error => {
        console.warn('Could not connect to SQLite db', error);
      }
    );
  }

  loadData(db) {
    if(!db) db = this.state.db;

    if(db) {
      db.transaction(tx => {
        tx.executeSql(`
CREATE TABLE IF NOT EXISTS 'test' (
  'key'   TEXT,
  'value' TEXT,
  PRIMARY KEY('key')
);
        `);

        tx.executeSql(`SELECT * FROM 'test'`, [], (tx, rs) => {
          console.log(`Table "test" contains ${rs.rows.length} rows`);

          let data = [];
          if(rs.rows.length > 0) {
            
            for(let i = 0; i < rs.rows.length; i++) {
              let row = rs.rows.item(i);
              data.push(row);
            }
          }

          this.setState({ data });
        });

        
      });
    } else {
      console.warn('"loadData": No db initialized');
    }
  }

  addData() {
    const { db, data } = this.state;

    if(db) {
      db.transaction(tx => {
        tx.executeSql(`INSERT INTO 'test' (key, value) VALUES (?, ?)`, [`tk-${data.length}`, `Test value ${data.length + 1}`]);
      },
      error => console.warn(`"addData" transaction error`, error),
      () => {
        this.loadData();
        console.log('"addData" transaction success');
      });
    } else {
      console.warn('"addData": No db initialized');
    }
  }

  renderData() {
    const { data } = this.state;

    console.log('render data', data);

    return data.length > 0 && (
      <>
        {data.map(({ key, value }) => <Text key={key}>{value}</Text>)}
      </>
    );
  }

  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView>
            <Button title="Add data" onPress={this.addData}/>
            <View>
              {this.renderData()}
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
}
