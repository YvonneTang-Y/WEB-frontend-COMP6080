import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import Bedroom from '../component/CreateEdit/Bedroom';

/**
 * for Bedroom: const { bedroom, idx, bedrooms, setBedrooms } = props;
 * fpr BedroomTextField: const { label, value, onChange } = props;
 */
describe('Bedroom Test', () => {
  /**
   * for each bedroom record
   * check if the associated value is correct
   */
  it('renderS Bedroom component successfully', () => {
    const bedroom = {
      single: 4,
      double: 3,
      queen: 2,
      king: 1,
    }
    const idx = 0;
    const bedrooms = [bedroom];
    const setBedrooms = jest.fn();

    render(
      <Bedroom key={'bedroom' + idx} bedroom={bedroom} idx={idx} bedrooms={bedrooms} setBedrooms={setBedrooms}/>
    )
    // Check if the Bedroom component renders the correct content
    expect(screen.getByText(`Bedroom ${idx + 1}:`)).toBeInTheDocument();
    expect(screen.getByLabelText('single').value).toBe(String(bedroom.single));
    expect(screen.getByLabelText('double').value).toBe(String(bedroom.double));
    expect(screen.getByLabelText('queen').value).toBe(String(bedroom.queen));
    expect(screen.getByLabelText('king').value).toBe(String(bedroom.king));
  })

  /*
   * when change the bed number
   * the associated number in 'bedroom' dictionary should also be updated
   */
  it('update a bedroom record successfully', () => {
    const bedroom = {
      single: 4,
      double: 3,
      queen: 2,
      king: 1,
    };
    const idx = 0;
    const bedrooms = [bedroom];
    const setBedrooms = jest.fn();

    render(
      <Bedroom key={'bedroom' + idx} bedroom={bedroom} idx={idx} bedrooms={bedrooms} setBedrooms={setBedrooms}/>
    );

    // userEvent.type(screen.getByLabelText('single'), '3');
    fireEvent.change(screen.getByLabelText('single'), { target: { value: '3' } });
    expect(setBedrooms).toHaveBeenCalledWith([{ single: 3, double: 3, queen: 2, king: 1 }]);
  });

  /**
   * when click on the delete icon
   * the associated bedroom record should be deleted
   */
  it('deletes Bedroom component successfully', () => {
    const bedroom = {
      single: 4,
      double: 3,
      queen: 2,
      king: 1,
    };
    const idx = 0;
    const bedrooms = [bedroom];
    const setBedrooms = jest.fn();
    render(
      <Bedroom key={'bedroom' + idx} bedroom={bedroom} idx={idx} bedrooms={bedrooms} setBedrooms={setBedrooms}/>
    );

    userEvent.click(screen.getByLabelText('Click me to delete a bedroom'));
    expect(setBedrooms).toHaveBeenCalledWith([]);
  })
})
