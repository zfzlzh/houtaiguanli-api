const express = require('express')
const pool = require('../../pool')
let router = express.Router();
module.exports = router;

/*
*GET /admin/table
*获取所有的桌台信息
*返回数据
*[{tid:xxx,tname:'xxx',status:''},...]
*/ 
router.get('/',(req,res)=>{
    pool.query('SELECT * FROM xfn_table ORDER BY tid',(err,result)=>{
        if(err) throw err;
        res.send(result);
    })
})

/*
*GET /admin/table：tid
*获取所有的桌台预定信息
*返回数据
*[{rid:xxx,contactName:'xxx',phone:'',contactTime:'',dinnerTime:''},...]
*/ 
router.get('/getInfo/:tid/:status',(req,res)=>{
    let tid=req.params.tid
    let status = req.params.status
    if (status == 2){
        pool.query('SELECT * FROM xfn_reservation WHERE tableId = ?',[tid],(err,result)=>{
            if(err) throw err;
            res.send(result);
        })
    }else if(status == 3){
        let output={
            order:[],
            table:[],
            orderDetail:[],
            dish:[]
        }
        pool.query('SELECT * FROM xfn_table WHERE tid = ?',[tid],(err,table)=>{
            if(err) throw err;
            output.table=table;
            pool.query('SELECT * FROM xfn_order WHERE tableId = ?',[tid],(err,orderList)=>{
                if(err) throw err;
                output.order=orderList;
               
                for(let o in orderList){
                    let oid = orderList[o].oid;
                    pool.query('SELECT * FROM xfn_order_detail WHERE orderId = ?',[oid],(err,orderDetail)=>{
                        if(err) throw err;
                        for(let od in orderDetail){
                            let did = orderDetail[od].dishId
                            output.orderDetail.push(orderDetail[od])
                            pool.query('SELECT * FROM xfn_dish WHERE did = ?',[did],(err,dishInfo)=>{
                                if(err) throw err;
                               
                                for(let d in dishInfo){
                                    output.dish.push(dishInfo[d]);
                                    if(o==orderList.length-1 && od==orderDetail.length-1){
                                        if(d==dishInfo.length-1){
                                            console.log(output)
                                            res.send(output)
                                        }
                                    }
                            
                                }
                                
                        })
                        }
                    
                    })
                }
            })
        })
    }
})

/*
*POST /admin/table
*提交新的预定信息
*返回信息
*{code:200,msg:'预订信息添加成功'}
*/ 
router.post('/',(req,res)=>{
    pool.query('INSERT INTO xfn_reservation SET ?',req.body,(err,result)=>{
        if(err) throw err;
        let tid = req.body.tableId
        console.log(tid)
        if(result.affectedRows>0){
            pool.query('UPDATE xfn_table SET status=? WHERE tid=?',[2,tid],(err,result)=>{
                console.log(result)
                if(result.changedRows>0){
                    res.send({code:200,msg:'预订信息添加成功'})
                }
            })
            
        }
    })
})