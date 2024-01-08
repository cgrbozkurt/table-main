import React from 'react'
import CustomTable from '../../CustomTable'
import {StoreColumn} from "@/lib/table";
import {addStore, langs} from "@/lib/data";
import AddPerson from '../addperson-admin';

const Store = () => {
  return (

      <div>
    <CustomTable   columns={StoreColumn}
                    langs={langs}
                    initial_dt={addStore}
                    perPage={10}
                    pagination={true}
                    paginationType="page"
                    defaultLang="Us"/>  
                    <AddPerson/>
    </div>
  )
}

export default Store