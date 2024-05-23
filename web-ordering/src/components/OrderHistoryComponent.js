import React from 'react';
import TopAppBar from './AppBarComponent';

import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Box from '@material-ui/core/Box';
import { Link } from 'react-router-dom';
import List from "@material-ui/core/List";
import ListSubheader from '@material-ui/core/ListSubheader';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
// import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';

import moment from 'moment';

import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/core/styles';
import { restaurants } from '../Firebase/firebase'

const useStyles = makeStyles(theme => ({
  root: {
    justifyContent: "center",
    backgroundColor: theme.palette.background.paper
  },
  gridcontainer: {
    margin: theme.spacing(2, 0, 2)
  },
  paper: {
    padding: theme.spacing(2),
  },
  button: {
    margin: theme.spacing(1)
  },
  title: {
    margin: theme.spacing(1, 1, 1),
    textAlign: 'center'
  },
  body: {
    margin: theme.spacing(2, 2, 2),
    textAlign: 'left'
  },
  list: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
    overflow: 'auto',
  },
  listSection: {
    backgroundColor: 'inherit',
  },
  ul: {
    backgroundColor: 'inherit',
    padding: 0,
  },
  table: {
    maxWidth: 360,
  },
}));

const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
});

const DialogTitle = withStyles(styles)(props => {
  const { children } = props;
  return (
    <MuiDialogTitle>
      <Typography variant="h6" align='center'>{children}</Typography>
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#ffbb93',
      main: '#ff8a65',
      dark: '#c75b39',
      contrastText: '#fff',
    },
    secondary: {
      light: '#cfcfcf',
      main: '#9e9e9e',
      dark: '#707070',
      contrastText: '#fff',
    },
  },
});

export default function OrderHistory(props) {
  const classes = useStyles();
  const orders = Array.from(props.orders);
  const unfinishedOrders = orders.filter(order => order.finished === false);

  const [open, setOpen] = React.useState(false);
  const [fullWidth] = React.useState(true);
  const [scroll, setScroll] = React.useState('paper');
  const [paymentChoice, setPaymentChoice] = React.useState('EFECTIVO');
  const [assistAlert, setAssistAlert] = React.useState(false);

  const handleClickOpen = scrollType => () => {
    setOpen(true);
    setScroll(scrollType);
  };
  const handlePaymentConfirm = (event) => {
    // if (paymentChoice === "inPerson") {
    //   restaurants.doc(props.restaurant).collection('tables').doc(props.table)
    //     .update({ status: "NEEDTO_ASSIST" })
    //     .then(console.log("set the assistance flag of", props.table, "to true"))
    //     .then(setAssistAlert(true))
    // }
    // else if (paymentChoice === "venmo") {
    //   setAssistAlert(true);
    // }
    console.log(paymentChoice)
    if (paymentChoice === "offline") {
      restaurants.doc(props.restaurant).collection('tables').doc(props.table)
        .update({
          paymentChoice: paymentChoice
        })
      restaurants.doc(props.restaurant).collection('tables').doc(props.table)
        .update({ status: "NEEDTO_ASSIST" })
        .then(console.log("set the assistance flag of", props.table, "to true"))
        .then(setAssistAlert(true))
    }else if(paymentChoice==="online"){
      onlinePay();

    }

    setOpen(false);
  };

  //razorpay
  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = () => {
        resolve(true)
      }
      script.onerror = () => {
        resolve(false)
      }
      document.body.appendChild(script)
    })
  }
  
  async function onlinePay(){
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')

		if (!res) {
			alert('Razorpay SDK failed to load. Are you online?')
		}
    var options = {
      "key": "rzp_test_uuMe2zKqfreEqY", // Enter the Key ID generated from the Dashboard
      "amount": invoiceTotal*100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      "currency": "INR",
      "name": "Acme Corp",
      "description": "Test Transaction", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      "handler": function (response){
        console.log(response);  
        afterPayment(response);
        
      },
      "notes": {
          "address": "Razorpay Corporate Office"
      },
      "theme": {
          "color": "#3399cc"
      }
    };
    var rzp1 = new window.Razorpay(options);
    rzp1.on('payment.failed', function (response){
      console.log('error:'+response);
      alert(response.error.code);
    });
    rzp1.open();
  }

  function afterPayment(response){
    restaurants.doc(props.restaurant).collection('tables').doc(props.table)
          .update({
            paymentChoice: paymentChoice
          })
    restaurants.doc(props.restaurant).collection('tables').doc(props.table)
    .update({ status: "NEEDTO_ASSIST" })
    .then(console.log("set the assistance flag of", props.table, "to true"))
    .then(setAssistAlert(true))
  }

  const handlePaymentChange = event => {
    setPaymentChoice(event.target.value);
  };

  function subtotal(orders) {
    var subtotal = 0;

    for (var order of orders) {
      var dishes = Array.from(order.dishes);
      for (var dish of dishes) {
        var quantity = dish.quantity;
        var price = dish.price;
        subtotal += quantity * price;
      }
    }
    return subtotal;
  };

  const invoiceSubtotal = parseFloat(subtotal(unfinishedOrders)).toFixed(2);
  //console.log('tax:'+props);
  const invoiceTaxes = parseFloat(0 * parseFloat(invoiceSubtotal)).toFixed(2);
  const invoiceTotal = parseFloat(invoiceSubtotal * (1 + 0)).toFixed(2);

  return (
    <ThemeProvider theme={theme}>
      <div>
        <TopAppBar restaurant={props.restaurant} table={props.table} />
        <div className={classes.root}>
          <div>
            <Grid container className={classes.gridcontainer}>
              <Grid item xs={12}>
                <Paper className={classes.paper}>
                  <Typography variant="body2" className={classes.body}>
                    Subtotal: ₹{invoiceSubtotal}
                  </Typography>
                  <Typography variant="body2" className={classes.body}>
                    Tax: ₹{invoiceTaxes}
                  </Typography>
                  <Typography variant="body2" className={classes.body}>
                    Total: ₹{invoiceTotal}
                  </Typography>
                  <Divider variant="middle" />
                  <div className={classes.button}>
                    <Link style={{ textDecoration: 'none', color: 'white' }} to={'/' + props.restaurant + '/' + props.table + '/menu'}>
                      <Button variant="contained" size="small" color="primary" className={classes.button}>
                        ADD MORE ITEMS
                    </Button>
                    </Link>
                    <Button variant="contained" size="small" color="primary" className={classes.button} onClick={handleClickOpen('paper')}>
                      Ready to Check
                    </Button>
                    <Dialog fullWidth={fullWidth} scroll={scroll} aria-labelledby="dialog-title" open={open}>
                      <DialogTitle disableTypography="true" id="dialog-title">
                        <Typography variant="subtitle1">
                          CHOOSE PAYMENT METHOD
                        </Typography>
                      </DialogTitle>
                      <DialogContent dividers>
                        <FormControl component="fieldset" className={classes.formControl}>
                          <RadioGroup aria-label="payment" name="payment" value={paymentChoice} onChange={handlePaymentChange}>
                            <FormControlLabel value="online" control={<Radio />} label="Pay Online" />
                            <FormControlLabel value="offline" control={<Radio />} label="Pay Cash" />
                          </RadioGroup>
                        </FormControl>
                      </DialogContent>
                      <Button autoFocus size="large" color="primary" onClick={()=>{setOpen(false)}}>
                        Cancel
                      </Button>
                      <Button autoFocus size="large" color="primary" onClick={handlePaymentConfirm}>
                        Confirm
                      </Button>

                    </Dialog>
                  </div>
                </Paper>
              </Grid>
            </Grid>
          </div>
          <Divider variant="middle" />
          <div>
            <Grid container className={classes.gridcontainer}>
              <Grid item xs={12}>
                <Paper className={classes.paper}>
                  {unfinishedOrders.length === 0 &&
                    <Typography color="textSecondary" variant="body2" className={classes.title}>
                      <Box fontStyle="italic" m={1}>
                        No History
                  </Box>
                    </Typography>
                  }
                  <List className={classes.list} subheader={<li />}>
                    {Array.from(unfinishedOrders).map((order,index) => (
                      <li key={`order-${index}`} className={classes.listSection}>
                        <ul className={classes.ul}>
                          <ListSubheader>{moment(order.ordertime.toDate()).calendar()}</ListSubheader>
                          {Array.from(order.dishes).map(dish => (
                            <Table key={`${dish}`} className={classes.table} aria-label="spanning table">
                              <TableBody>
                                <TableRow key={`dish-${dish.name}`}>
                                  <TableCell width={100}>{dish.name}</TableCell>
                                  <TableCell width={50} align="right">{`${dish.quantity} x`}</TableCell>
                                  <TableCell align="right">{`₹${dish.price}`}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </div>

        </div>
      </div>
      <div>
        <Dialog
          open={assistAlert}
          onClose={() => { setAssistAlert(false) }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            {paymentChoice === "venmo" ?
              < img
                width={200}
                height={200}
                src="https://firebasestorage.googleapis.com/v0/b/qr-code-ordering-system.appspot.com/o/koisushiMenu%2Flogo.png?alt=media&token=9dda257c-9f74-47f1-bfd3-90caadd8d439"
              /> :
              < DialogContentText id="alert-dialog-description">
                Message sent, please wait for someone comes to help you
            </DialogContentText>

            }
          </DialogContent>

        </Dialog>
      </div>
    </ThemeProvider >
  );
}