import { Injectable } from '@angular/core';
import { Angular5Csv } from 'angular5-csv/Angular5-csv';

@Injectable()
export class GCsvService {

  constructor() { }





  generate(data,name)
  {

        /*let data = [
      {
        name: "Test 1",
        age: 13,
        average: 8.2,
        approved: true,
        description: "using 'Content here, content here' "
      },
      {
        name: 'Test 2',
        age: 11,
        average: 8.2,
        approved: true,
        description: "using 'Content here, content here' "
      }];*/

      let content=[];
      let headers;
      for(let dta of data)
      {
        if( dta.length > 0)
        {

          for(let row of dta)
          {
            headers=Object.keys(row);
            content.push(row);
          }
        }
      }

      let options = {
   fieldSeparator: ',',
   quoteStrings: '"',
   decimalseparator: '.',

   useBom: true,
   headers: headers
 };

      new Angular5Csv(content, name, options);
  }

}
