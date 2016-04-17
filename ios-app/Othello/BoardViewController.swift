//
//  BoardViewController.swift
//  Othello
//
//  Created by David Wolgemuth on 4/14/16.
//  Copyright © 2016 David. All rights reserved.
//

import UIKit

class BoardViewController: UIViewController
{
    @IBOutlet weak var stackView: UIStackView!
    override func viewDidLoad()
    {
        setBorders()
        super.viewDidLoad()
        setTile(1, col: 1, player: 1)
        setTile(2, col: 2, player: 2)
    }
    func setTile(row: Int, col: Int, player: Int)
    {
        if let rowView = stackView.subviews[row] as? RowViewController {
            rowView.setColumn(col, toPlayer: player)
        }
    }
    func setBorders()
    {
        for row in 0..<stackView.subviews.count {
            if let view = stackView.subviews[row] as? RowViewController {
                for col in 0..<view.subviews.count {
                    view.setBorder(col)
                }
            }
        }
    }
}

class RowViewController: UIStackView
{
    func setColumn(column: Int, toPlayer player: Int)
    {
        if let button = self.subviews[column] as? UIButton {
            switch player {
            case 1:
                button.setImage(UIImage(named: "P1Tile"), forState: .Normal)
                break
            case 2:
                button.setImage(UIImage(named: "P2Tile"), forState: .Normal)
                break
            default:
                button.setImage(nil, forState: .Normal)
                break
            }
        }
    }
    func setBorder(column: Int)
    {
        if let button = self.subviews[column] as? UIButton {
            button.setTitle("", forState: .Normal)
            button.layer.borderColor = UIColor.blackColor().CGColor
            button.layer.borderWidth = 2
        }
    }
}
