const publishOrder = (iexec, dataset_address, dataset_price, dataset_volume, dataset_apprestrict) => async () => {
    try {
      const dataset = dataset_address;
      const datasetprice = dataset_price;
      const volume = dataset_volume
      const apprestrict = dataset_apprestrict;
      const tag = "0x0000000000000000000000000000000000000000000000000000000000000001";
      const signedOrder = await iexec.order.signDatasetorder(
        await iexec.order.createDatasetorder({
          dataset,
          datasetprice,
          volume,
          apprestrict,
          tag
        })
      );
      const orderHash = await iexec.order.publishDatasetorder(signedOrder);
      return orderHash;
    } catch (error) {
      throw Error(error);
    } 
};

const showOrderbook = (iexec, datasetAddress, apprestrict) => async () => {
  try {
    const res = await iexec.orderbook.fetchDatasetOrderbook(datasetAddress, {app: apprestrict});
    return res;
  } catch (error) {
    throw Error(error);
  } 
};

const unpublishOrder = (iexec, orderHash) => async () => {
  try {
    await iexec.order.unpublishDatasetorder(orderHash);
  } catch (error) {
    throw Error(error);
  } 
};

export {publishOrder, showOrderbook, unpublishOrder};